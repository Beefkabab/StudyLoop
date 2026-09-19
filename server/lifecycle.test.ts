import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createMockContext(userId?: number, name?: string, role = "user"): TrpcContext {
  return {
    user: userId
      ? {
          id: userId,
          openId: `mock_user_${userId}`,
          name: name || "Test User",
          email: "test@example.com",
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Participant Lifecycle Platform (Release 1)", () => {
  const profileKey = "demo_profile_rural_male"; // Marcus Davis
  const participantCaller = appRouter.createCaller(createMockContext(101, "Marcus Davis"));
  const researcherCaller = appRouter.createCaller(
    createMockContext(203, "Sarah Lindquist, CRC", "researcher")
  );

  it("organizes participant studies into 4 distinct lifecycle sections", async () => {
    const overview = await participantCaller.applications.getLifecycleOverview({ profileKey });

    expect(overview).toHaveProperty("inProgress");
    expect(overview).toHaveProperty("activeStudies");
    expect(overview).toHaveProperty("history");
    expect(overview).toHaveProperty("recommended");

    expect(Array.isArray(overview.inProgress)).toBe(true);
    expect(Array.isArray(overview.activeStudies)).toBe(true);
    expect(Array.isArray(overview.history)).toBe(true);
    expect(Array.isArray(overview.recommended)).toBe(true);

    // Verify study cards in inProgress have required fields
    if (overview.inProgress.length > 0) {
      const item = overview.inProgress[0];
      expect(item.study).toHaveProperty("title");
      expect(item.application).toHaveProperty("status");
      expect(item.application).toHaveProperty("statusLabel");
      expect(item).toHaveProperty("whatHappensNext");
      expect(item.application).toHaveProperty("statusUpdatedAt");
    }
  });

  it("strictly protects internal staff notes from participant disclosure (Data Minimization)", async () => {
    const overview = await participantCaller.applications.getLifecycleOverview({ profileKey });
    expect(overview.inProgress.length).toBeGreaterThan(0);
    const appId = overview.inProgress[0].application.id;

    // Researcher adds both a participant-facing note and a confidential internal staff note
    await researcherCaller.researcher.updateStatusWithHistory({
      applicationId: appId,
      status: "under_review",
      participantFacingNote: "Coordinator Sarah is reviewing your metabolic eligibility checklist.",
      internalStaffNote: "CONFIDENTIAL_CLINICAL_NOTE: Check lab batch 4B for fasting glucose criteria.",
    });

    // Participant fetches detail
    const participantDetail = await participantCaller.applications.getApplicationDetail({
      applicationId: appId,
      profileKey,
    });

    expect(participantDetail).not.toBeNull();
    // Participant-facing explanation must be visible
    expect(participantDetail?.application.participantFacingNote).toBe(
      "Coordinator Sarah is reviewing your metabolic eligibility checklist."
    );
    // Internal staff note MUST NEVER be exposed to participant endpoints
    expect((participantDetail?.application as any).internalStaffNote).toBeUndefined();
  });

  it("records immutable status transition audit history with authorized actor", async () => {
    const overview = await participantCaller.applications.getLifecycleOverview({ profileKey });
    const appId = overview.inProgress[0].application.id;

    // Transition status to eligible_next_step
    const updateResult = await researcherCaller.researcher.updateStatusWithHistory({
      applicationId: appId,
      status: "eligible_next_step",
      participantFacingNote: "Congratulations! You qualified for the baseline study visit.",
      internalStaffNote: "Pre-screener verified. Room 302 booked.",
      assignedCoordinatorId: 203,
      assignedCoordinatorName: "Sarah Lindquist, CRC",
    });

    expect(updateResult.success).toBe(true);

    // Verify detail reflects the new status
    const detail = await participantCaller.applications.getApplicationDetail({
      applicationId: appId,
      profileKey,
    });

    expect(detail?.application.status).toBe("eligible_next_step");
    expect(detail?.application.assignedCoordinatorName).toBe("Sarah Lindquist, CRC");

    // Check status history audit trail (sorted descending, index 0 is latest)
    expect(detail?.history.length).toBeGreaterThan(0);
    const latestHistory = detail?.history[0];
    expect(latestHistory?.toStatus).toBe("eligible_next_step");
    expect(latestHistory?.changedByName).toBe("Sarah Lindquist, CRC");
  });

  it("supports structured participant tasks and interactive completion", async () => {
    const overview = await participantCaller.applications.getLifecycleOverview({ profileKey });
    const appId = overview.inProgress[0].application.id;

    // 1. Researcher creates a task for the participant
    const task = await researcherCaller.researcher.createTask({
      profileKey,
      applicationId: appId,
      title: "Confirm Clinic Visit Availability",
      description: "Please confirm your availability for Tuesday morning or Thursday afternoon.",
      taskType: "confirm_availability",
      dueDate: new Date(Date.now() + 86400000 * 3),
      actionUrl: "/my-studies",
    });

    expect(task.id).toBeDefined();
    expect(task.status).toBe("pending");

    // 2. Participant views active tasks
    const tasks = await participantCaller.tasks.list({ profileKey });
    const createdTask = tasks.find((t) => t.id === task.id);
    expect(createdTask).toBeDefined();
    expect(createdTask?.status).toBe("pending");

    // 3. Participant completes the task
    const completeRes = await participantCaller.tasks.complete({
      taskId: task.id,
      profileKey,
    });
    expect(completeRes.status).toBe("completed");

    // 4. Verify task is now marked completed with timestamp
    const updatedTasks = await participantCaller.tasks.list({ profileKey });
    const finishedTask = updatedTasks.find((t) => t.id === task.id);
    expect(finishedTask?.status).toBe("completed");
    expect(finishedTask?.completedAt).not.toBeNull();
  });

  it("stores and audits versioned participant consent and notification preferences", async () => {
    // 1. Participant views consents
    const consents = await participantCaller.consents.list({ profileKey });
    expect(Array.isArray(consents)).toBe(true);
    expect(consents.length).toBeGreaterThan(0);

    // 2. Participant updates non-essential notification preference (e.g. marketing_email or sms_opt_in)
    const updateRes = await participantCaller.consents.update({
      profileKey,
      consentType: "sms_opt_in",
      isGranted: true,
      version: "v1.2",
    });

    expect(updateRes.success).toBe(true);

    // 3. Verify consent was updated
    const updatedConsents = await participantCaller.consents.list({ profileKey });
    const smsConsent = updatedConsents.find((c) => c.consentType === "sms_opt_in");
    expect(smsConsent?.isGranted).toBe(true);
    expect(smsConsent?.version).toBe("v1.2");
  });

  it("provides alternative studies when a participant withdraws or is not selected", async () => {
    const alternatives = await participantCaller.applications.getAlternatives({
      studyId: 1,
      profileKey,
    });

    expect(Array.isArray(alternatives)).toBe(true);
    // Should return alternative recruiting studies
    for (const alt of alternatives) {
      expect(alt.id).not.toBe(1);
      expect(alt.status).toBe("recruiting");
    }
  });

  it("calculates profile completion status and missing checklist items", async () => {
    const status = await participantCaller.profile.completionStatus({ profileKey });

    expect(status).toHaveProperty("percentage");
    expect(status).toHaveProperty("checklist");
    expect(status.percentage).toBeGreaterThan(0);
    expect(status.percentage).toBeLessThanOrEqual(100);
    expect(Array.isArray(status.checklist)).toBe(true);

    for (const item of status.checklist) {
      expect(item).toHaveProperty("key");
      expect(item).toHaveProperty("label");
      expect(item).toHaveProperty("completed");
      expect(item).toHaveProperty("why");
    }
  });
});
