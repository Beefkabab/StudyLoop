import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import type { Study, ParticipantProfile } from "../drizzle/schema";
import {
  getAllStudies,
  getStudyById,
  getStudyBySlug,
  getStudyScreenerQuestions,
  createStudyWithScreeners,
  updateStudy,
  upsertParticipantProfile,
  getParticipantProfileByKey,
  getParticipantProfileById,
  toggleSaveStudy,
  getSavedStudiesForProfile,
  getParticipantApplications,
  getApplicationById,
  addStudyReminder,
  getRemindersForProfile,
  calculateMatchScore,
  submitApplicationWithScreener,
  updateApplicationStatusWithAudit,
  withdrawApplication,
  getAlternativeStudiesForParticipant,
  getStatusHistoryForApplication,
  getTasksForProfile,
  createParticipantTask,
  completeParticipantTask,
  getConsentsForProfile,
  updateParticipantConsent,
  getNotificationsForProfile,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
  getApplicationsForResearcher,
  assignCoordinatorToApplication,
  closeStudyRecruitment,
  getAdminAuditRecords,
  getAdminAnalyticsSummary,
  trackAnalyticsEvent,
  updateApplicationStatus,
  createOrganizationInquiry,
  authenticateLocalUser,
  registerLocalUser,
} from "./db";

export const STATUS_META: Record<string, { label: string; whatHappensNext: string; color: string }> = {
  draft: {
    label: "Draft application",
    whatHappensNext: "Complete remaining screening questions and submit your profile for coordinator review.",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
  submitted: {
    label: "Application submitted",
    whatHappensNext: "Your application is queued. The study team typically performs initial review within 2 business days.",
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  under_review: {
    label: "Under review",
    whatHappensNext: "A research coordinator is evaluating your protocol fit and scheduling availability.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  action_needed: {
    label: "Action needed",
    whatHappensNext: "The research team has requested an action from you. Review your pending tasks below.",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  pre_screening: {
    label: "Pre-screening",
    whatHappensNext: "Additional protocol-specific screening questions or preliminary verification is underway.",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  eligible_next_step: {
    label: "Eligible for next step",
    whatHappensNext: "Congratulations! You meet protocol inclusion criteria. Next step: confirm your intake visit schedule.",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  enrolled: {
    label: "Enrolled",
    whatHappensNext: "You are actively participating. Track your scheduled visits, milestones, and compensation below.",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  completed: {
    label: "Completed",
    whatHappensNext: "You have completed all protocol visits. Thank you for contributing to clinical research advancement!",
    color: "bg-teal-50 text-teal-800 border-teal-200",
  },
  not_selected: {
    label: "Not selected",
    whatHappensNext: "Protocol criteria were not a direct fit for this study. We've matched you with active alternative studies below.",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  withdrawn: {
    label: "Withdrawn",
    whatHappensNext: "You have withdrawn from this study. You can explore new opportunities anytime.",
    color: "bg-slate-100 text-slate-500 border-slate-200",
  },
  study_closed: {
    label: "Study closed",
    whatHappensNext: "Recruitment for this trial has reached target capacity. Check out other matching studies below.",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  // Legacy aliases
  screener_passed: {
    label: "Application submitted",
    whatHappensNext: "Your screening qualified. Study coordinator will contact you.",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  screened_out: {
    label: "Not selected",
    whatHappensNext: "Based on protocol requirements, this trial was not a fit. Explore other opportunities below.",
    color: "bg-slate-100 text-slate-600 border-slate-200",
  },
  pending_contact: {
    label: "Under review",
    whatHappensNext: "Research team is reviewing your schedule and transport logistics.",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  scheduled: {
    label: "Eligible for next step",
    whatHappensNext: "Initial visit booked. Review preparation instructions and bring photo ID.",
    color: "bg-sky-50 text-sky-800 border-sky-200",
  },
};

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    loginWithCredentials: publicProcedure
      .input(
        z.object({
          username: z.string().min(3),
          password: z.string().min(4),
        })
      )
      .mutation(async ({ input }) => {
        const user = await authenticateLocalUser(input.username, input.password);
        if (!user) {
          throw new Error("Invalid username or password");
        }
        return {
          success: true,
          user: {
            id: user.id,
            openId: user.openId,
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        };
      }),
    registerWithCredentials: publicProcedure
      .input(
        z.object({
          username: z.string().min(3),
          password: z.string().min(4),
          name: z.string().min(2),
          email: z.string().email(),
          role: z.enum(["user", "researcher"]).default("user"),
        })
      )
      .mutation(async ({ input }) => {
        const user = await registerLocalUser({
          username: input.username,
          passwordPlain: input.password,
          name: input.name,
          email: input.email,
          role: input.role,
        });
        return {
          success: true,
          user,
        };
      }),
  }),

  /* ==================== STUDIES ROUTER ==================== */
  studies: router({
    list: publicProcedure
      .input(
        z
          .object({
            studyType: z.string().optional(),
            isHealthyOnly: z.boolean().optional(),
            search: z.string().optional(),
            locationType: z.string().optional(),
            profileKey: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const studyList = await getAllStudies({
          studyType: input?.studyType,
          isHealthyOnly: input?.isHealthyOnly,
          search: input?.search,
          locationType: input?.locationType,
        });

        if (input?.profileKey) {
          const profile = await getParticipantProfileByKey(input.profileKey);
          if (profile) {
            const enriched = studyList.map((study) => {
              const match = calculateMatchScore(study, profile);
              return {
                ...study,
                matchScore: match.score,
                matchReasons: match.matchReasons,
                matchFlags: match.flags,
              };
            });
            return enriched.sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));
          }
        }

        return studyList.map((s) => ({
          ...s,
          matchScore: null as number | null,
          matchReasons: [] as string[],
          matchFlags: [] as string[],
        }));
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string(), profileKey: z.string().optional() }))
      .query(async ({ input }) => {
        const study = await getStudyBySlug(input.slug);
        if (!study) return null;

        const rawQuestions = await getStudyScreenerQuestions(study.id);
        // Data minimization: Return participant-safe question DTO without expected answers or disqualification rules
        const questions = rawQuestions.map((q) => ({
          id: q.id,
          studyId: q.studyId,
          orderIndex: q.orderIndex,
          questionText: q.questionText,
          explanation: q.explanation,
          questionType: q.questionType,
          options: q.options,
        }));

        let matchResult = null;
        if (input.profileKey) {
          const profile = await getParticipantProfileByKey(input.profileKey);
          if (profile) {
            matchResult = calculateMatchScore(study, profile);
          }
        }

        return {
          ...study,
          screenerQuestions: questions,
          match: matchResult,
        };
      }),

    create: publicProcedure
      .input(
        z.object({
          slug: z.string(),
          title: z.string().min(5),
          sponsorName: z.string().min(2),
          sponsorType: z.enum(["university", "hospital", "biotech", "pharma", "research_center"]),
          piName: z.string().min(2),
          piTitle: z.string().optional(),
          studyType: z.enum([
            "clinical_trial",
            "blood_draw",
            "observational_survey",
            "imaging_mri",
            "cognitive_assessment",
          ]),
          compensationAmount: z.number().min(0),
          compensationType: z.string().default("Direct Payment (Stipend)"),
          compensationSchedule: z.string().optional(),
          timeCommitment: z.string().min(2),
          durationWeeks: z.number().default(1),
          locationType: z.enum(["in_person", "remote", "hybrid"]),
          city: z.string().min(2),
          state: z.string().min(2),
          facilityAddress: z.string().optional(),
          summary: z.string().min(10),
          fullDescription: z.string().min(20),
          irbApprovalNumber: z.string().default("IRB-2026-PENDING"),
          targetEnrollment: z.number().default(50),
          minAge: z.number().default(18),
          maxAge: z.number().default(85),
          targetGender: z.enum(["all", "male", "female"]).default("all"),
          healthyVolunteersAccepted: z.boolean().default(true),
          targetDemographicFocus: z.string().optional(),
          questions: z
            .array(
              z.object({
                questionText: z.string().min(5),
                explanation: z.string().optional(),
                expectedAnswer: z.string(),
                isDisqualifying: z.boolean().default(true),
              })
            )
            .default([]),
        })
      )
      .mutation(async ({ input }) => {
        const { questions, ...studyData } = input;
        const studyId = await createStudyWithScreeners({
          study: studyData,
          questions,
        });
        return { success: true, studyId };
      }),

    update: publicProcedure
      .input(
        z.object({
          studyId: z.number(),
          title: z.string().min(5).optional(),
          summary: z.string().min(10).optional(),
          fullDescription: z.string().min(20).optional(),
          compensationAmount: z.number().min(0).optional(),
          compensationSchedule: z.string().optional(),
          timeCommitment: z.string().optional(),
          durationWeeks: z.number().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          targetEnrollment: z.number().optional(),
          currentEnrolled: z.number().optional(),
          minAge: z.number().optional(),
          maxAge: z.number().optional(),
          targetGender: z.enum(["all", "male", "female"]).optional(),
          healthyVolunteersAccepted: z.boolean().optional(),
          targetDemographicFocus: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { studyId, ...data } = input;
        const updated = await updateStudy(studyId, data);
        return { success: true, study: updated };
      }),
  }),

  /* ==================== UNIVERSAL PROFILE ROUTER ==================== */
  profile: router({
    get: publicProcedure
      .input(z.object({ profileKey: z.string() }))
      .query(async ({ input }) => {
        return (await getParticipantProfileByKey(input.profileKey)) ?? null;
      }),

    save: publicProcedure
      .input(
        z.object({
          profileKey: z.string(),
          fullName: z.string().min(2),
          email: z.string().email(),
          phone: z.string().optional(),
          age: z.number().min(18).max(110),
          gender: z.enum(["female", "male", "non_binary", "prefer_not_to_say"]),
          educationLevel: z.enum([
            "high_school_or_less",
            "some_college",
            "bachelors",
            "graduate_degree",
          ]),
          livingEnvironment: z.enum(["urban", "suburban", "rural"]),
          city: z.string().min(2),
          state: z.string().min(2),
          zipCode: z.string().optional(),
          travelDistanceMiles: z.number().default(25),
          isHealthyVolunteer: z.boolean(),
          conditions: z.array(z.string()).default([]),
          medications: z.array(z.string()).default([]),
          hasRecentAntibiotics: z.boolean().default(false),
          smokerStatus: z.enum(["never", "former", "current"]).default("never"),
          preferredContactMethod: z.enum(["email", "phone", "sms"]).default("email"),
          isContactVerified: z.boolean().default(false),
          preferredLocationType: z.enum(["in_person", "remote", "hybrid", "no_preference"]).default("no_preference"),
          preferredLanguage: z.string().default("English"),
          transportationAccess: z.enum(["personal_vehicle", "public_transit", "rideshare", "needs_assistance", "none"]).default("personal_vehicle"),
          accessibilityNeeds: z.string().optional(),
          hasCaregiver: z.boolean().default(false),
          hasInternetSmartphone: z.boolean().default(true),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const profileId = await upsertParticipantProfile({
          ...input,
          userId: ctx.user?.id ?? null,
        });
        trackAnalyticsEvent("profile_updated", "participant_experience", {
          profileKey: input.profileKey,
          metadata: { city: input.city, travelDistanceMiles: input.travelDistanceMiles },
        });
        return { success: true, profileId, profileKey: input.profileKey };
      }),

    completionStatus: publicProcedure
      .input(z.object({ profileKey: z.string() }))
      .query(async ({ input }) => {
        const profile = await getParticipantProfileByKey(input.profileKey);
        if (!profile) {
          return {
            percentage: 0,
            checklist: [
              { key: "contact", label: "Contact & Phone", completed: false, why: "Enables study coordinators to contact you directly for screening." },
              { key: "location", label: "Location & Travel Radius", completed: false, why: "Filters clinical trial sites within your travel radius." },
              { key: "preferences", label: "In-Person vs. Remote", completed: false, why: "Matches you to flexible at-home studies or hospital trials." },
              { key: "health", label: "Baseline Demographics & Health", completed: false, why: "Powers protocol inclusion/exclusion matching algorithms." },
              { key: "logistics", label: "Logistics & Transport", completed: false, why: "Assists study teams in planning mileage stipends and accessibility." },
            ],
          };
        }

        const checklist = [
          {
            key: "contact",
            label: "Contact & Phone",
            completed: Boolean(profile.fullName && profile.email && profile.phone),
            why: "Enables study coordinators to contact you directly for screening.",
          },
          {
            key: "location",
            label: "Location & Travel Radius",
            completed: Boolean(profile.city && profile.state && profile.zipCode && profile.travelDistanceMiles),
            why: "Filters clinical trial sites within your travel radius.",
          },
          {
            key: "preferences",
            label: "In-Person vs. Remote",
            completed: Boolean(profile.preferredLocationType && profile.preferredContactMethod),
            why: "Matches you to flexible at-home studies or hospital trials.",
          },
          {
            key: "health",
            label: "Baseline Demographics & Health",
            completed: Boolean(profile.age && profile.gender && profile.educationLevel),
            why: "Powers protocol inclusion/exclusion matching algorithms.",
          },
          {
            key: "logistics",
            label: "Logistics & Transport",
            completed: Boolean(profile.transportationAccess),
            why: "Assists study teams in planning mileage stipends and accessibility.",
          },
        ];

        const completedCount = checklist.filter((item) => item.completed).length;
        const percentage = Math.round((completedCount / checklist.length) * 100);

        return { percentage, checklist };
      }),
  }),

  /* ==================== SAVED STUDIES & BOOKMARKS ==================== */
  saved: router({
    list: publicProcedure
      .input(z.object({ profileKey: z.string() }))
      .query(async ({ input }) => {
        return await getSavedStudiesForProfile(input.profileKey);
      }),

    toggle: publicProcedure
      .input(
        z.object({
          profileKey: z.string(),
          studyId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return await toggleSaveStudy(input.profileKey, input.studyId);
      }),
  }),

  /* ==================== PARTICIPANT APPLICATIONS & LIFECYCLE ==================== */
  applications: router({
    myApplications: publicProcedure
      .input(z.object({ profileKey: z.string() }))
      .query(async ({ input }) => {
        return await getParticipantApplications(input.profileKey);
      }),

    getLifecycleOverview: publicProcedure
      .input(z.object({ profileKey: z.string() }))
      .query(async ({ input }) => {
        const appsWithStudies = await getParticipantApplications(input.profileKey);
        const allTasks = await getTasksForProfile(input.profileKey);
        const profile = await getParticipantProfileByKey(input.profileKey);
        const allStudies = await getAllStudies();

        // 1. Recommended for you:
        let recommendedStudies: Array<Study & { matchScore: number; matchReasons: string[] }> = [];
        if (profile) {
          const appliedStudyIds = new Set(appsWithStudies.map((a) => a.study.id));
          recommendedStudies = allStudies
            .filter((s) => !appliedStudyIds.has(s.id) && s.status === "recruiting")
            .map((s) => {
              const match = calculateMatchScore(s, profile);
              return {
                ...s,
                matchScore: match.score,
                matchReasons: match.matchReasons,
              };
            })
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 4);
        }

        // Section mappings
        const inProgressStatuses = new Set([
          "draft",
          "submitted",
          "under_review",
          "action_needed",
          "pre_screening",
          "eligible_next_step",
          "screener_passed",
          "pending_contact",
          "scheduled",
        ]);

        const inProgress = appsWithStudies
          .filter((item) => inProgressStatuses.has(item.application.status))
          .map((item) => {
            const statusKey = item.application.status;
            const meta = STATUS_META[statusKey] || STATUS_META.submitted;
            const appTasks = allTasks.filter(
              (t) => t.applicationId === item.application.id && t.status === "pending"
            );
            return {
              application: {
                id: item.application.id,
                status: item.application.status,
                statusLabel: meta.label,
                statusColor: meta.color,
                statusUpdatedAt: item.application.statusUpdatedAt || item.application.updatedAt,
                participantFacingNote: item.application.participantFacingNote,
                appointmentDate: item.application.appointmentDate,
                assignedCoordinatorName: item.application.assignedCoordinatorName,
                createdAt: item.application.createdAt,
              },
              study: item.study,
              whatHappensNext: meta.whatHappensNext,
              pendingTasks: appTasks,
              hasActionRequired: statusKey === "action_needed" || appTasks.length > 0,
            };
          });

        const activeStudies = appsWithStudies
          .filter((item) => item.application.status === "enrolled")
          .map((item) => {
            const meta = STATUS_META.enrolled;
            const appTasks = allTasks.filter(
              (t) => t.applicationId === item.application.id && t.status === "pending"
            );
            return {
              application: {
                id: item.application.id,
                status: item.application.status,
                statusLabel: meta.label,
                statusColor: meta.color,
                statusUpdatedAt: item.application.statusUpdatedAt || item.application.updatedAt,
                participantFacingNote: item.application.participantFacingNote,
                appointmentDate: item.application.appointmentDate,
                assignedCoordinatorName: item.application.assignedCoordinatorName,
                createdAt: item.application.createdAt,
              },
              study: item.study,
              whatHappensNext: meta.whatHappensNext,
              pendingTasks: appTasks,
            };
          });

        const historyStatuses = new Set([
          "completed",
          "not_selected",
          "withdrawn",
          "study_closed",
          "screened_out",
        ]);

        const history = await Promise.all(
          appsWithStudies
            .filter((item) => historyStatuses.has(item.application.status))
            .map(async (item) => {
              const statusKey = item.application.status;
              const meta = STATUS_META[statusKey] || STATUS_META.not_selected;
              const alternatives =
                statusKey === "not_selected" || statusKey === "study_closed" || statusKey === "screened_out"
                  ? (await getAlternativeStudiesForParticipant(item.study.id, input.profileKey)).slice(0, 3)
                  : [];

              return {
                application: {
                  id: item.application.id,
                  status: item.application.status,
                  statusLabel: meta.label,
                  statusColor: meta.color,
                  statusUpdatedAt: item.application.statusUpdatedAt || item.application.updatedAt,
                  participantFacingNote: item.application.participantFacingNote,
                  createdAt: item.application.createdAt,
                },
                study: item.study,
                whatHappensNext: meta.whatHappensNext,
                recommendedAlternatives: alternatives,
              };
            })
        );

        return {
          recommended: recommendedStudies,
          inProgress,
          active: activeStudies,
          activeStudies,
          history,
          counts: {
            recommended: recommendedStudies.length,
            inProgress: inProgress.length,
            active: activeStudies.length,
            history: history.length,
          },
        };
      }),

    getApplicationDetail: publicProcedure
      .input(z.object({ applicationId: z.number(), profileKey: z.string() }))
      .query(async ({ input }) => {
        const detail = await getApplicationById(input.applicationId);
        if (!detail) throw new Error("Application not found");
        if (detail.profile.profileKey !== input.profileKey) {
          throw new Error("Unauthorized to view this application");
        }

        const rawHistory = await getStatusHistoryForApplication(input.applicationId);
        // Data minimization: strictly strip internalNote before sending to participant!
        const history = rawHistory.map((h) => ({
          id: h.id,
          toStatus: h.toStatus,
          statusLabel: (STATUS_META[h.toStatus] || STATUS_META.submitted).label,
          participantFacingNote: h.participantFacingNote,
          changedByName: h.changedByName,
          createdAt: h.createdAt,
        }));

        const allTasks = await getTasksForProfile(input.profileKey);
        const relatedTasks = allTasks.filter((t) => t.applicationId === input.applicationId);
        const meta = STATUS_META[detail.application.status] || STATUS_META.submitted;

        return {
          application: {
            id: detail.application.id,
            status: detail.application.status,
            statusLabel: meta.label,
            statusColor: meta.color,
            qualificationScore: detail.application.qualificationScore,
            participantFacingNote: detail.application.participantFacingNote,
            appointmentDate: detail.application.appointmentDate,
            assignedCoordinatorName: detail.application.assignedCoordinatorName,
            createdAt: detail.application.createdAt,
            statusUpdatedAt: detail.application.statusUpdatedAt,
          },
          study: detail.study,
          whatHappensNext: meta.whatHappensNext,
          history,
          tasks: relatedTasks,
        };
      }),

    withdraw: publicProcedure
      .input(
        z.object({
          applicationId: z.number(),
          profileKey: z.string(),
          reason: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await withdrawApplication(input.applicationId, input.profileKey, input.reason);
      }),

    getAlternatives: publicProcedure
      .input(z.object({ studyId: z.number(), profileKey: z.string().optional() }))
      .query(async ({ input }) => {
        return await getAlternativeStudiesForParticipant(input.studyId, input.profileKey);
      }),

    myReminders: publicProcedure
      .input(z.object({ profileKey: z.string() }))
      .query(async ({ input }) => {
        return await getRemindersForProfile(input.profileKey);
      }),

    addReminder: publicProcedure
      .input(
        z.object({
          applicationId: z.number(),
          profileKey: z.string(),
          title: z.string(),
          scheduledFor: z.date(),
          channel: z.enum(["sms", "email", "in_app"]).default("in_app"),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await addStudyReminder(input);
        return { success: true, reminderId: id };
      }),

    checkEligibility: publicProcedure
      .input(
        z.object({
          studyId: z.number(),
          answers: z.record(z.string(), z.string()),
        })
      )
      .mutation(async ({ input }) => {
        const questions = await getStudyScreenerQuestions(input.studyId);
        let passed = true;
        const disqualifications: string[] = [];

        for (const q of questions) {
          const rawAnswer = input.answers[q.id.toString()];
          const userAnswer = (rawAnswer || "").trim().toLowerCase();
          const expected = q.expectedAnswer.trim().toLowerCase();

          if (!rawAnswer || userAnswer === "") {
            passed = false;
            disqualifications.push(`Missing required response for question: ${q.questionText}`);
          } else if (q.isDisqualifying && userAnswer !== expected) {
            passed = false;
            disqualifications.push(
              q.disqualificationReason || `Criteria not met on question: ${q.questionText}`
            );
          }
        }

        const qualificationScore = passed ? 100 : Math.max(20, 100 - disqualifications.length * 30);
        return {
          passed,
          disqualifications,
          qualificationScore,
        };
      }),

    quickApply: publicProcedure
      .input(
        z.object({
          studyId: z.number(),
          answers: z.record(z.string(), z.string()),
          fullName: z.string().min(2),
          email: z.string().email(),
          phone: z.string().optional(),
          age: z.number().min(18).max(110).default(35),
          city: z.string().default("Durham"),
          state: z.string().default("NC"),
          zipCode: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const profileKey = `vol_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const profileId = await upsertParticipantProfile({
          profileKey,
          userId: ctx.user?.id ?? null,
          fullName: input.fullName,
          email: input.email,
          phone: input.phone || "",
          age: input.age,
          gender: "prefer_not_to_say",
          educationLevel: "bachelors",
          livingEnvironment: "suburban",
          city: input.city,
          state: input.state,
          zipCode: input.zipCode || "27701",
          travelDistanceMiles: 30,
          isHealthyVolunteer: true,
          conditions: [],
          medications: [],
          hasRecentAntibiotics: false,
          smokerStatus: "never",
          preferredContactMethod: "email",
          isContactVerified: false,
          preferredLocationType: "no_preference",
          preferredLanguage: "English",
          transportationAccess: "personal_vehicle",
          accessibilityNeeds: null,
          hasCaregiver: false,
          hasInternetSmartphone: true,
        });

        const result = await submitApplicationWithScreener({
          studyId: input.studyId,
          profileId,
          answers: input.answers,
        });

        if (result.passed) {
          await addStudyReminder({
            applicationId: result.applicationId,
            profileKey,
            title: "Study Coordinator Outreach & Consent Review",
            scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            channel: "in_app",
            notes: "Expect a coordinator call/email to confirm your screening answers and walk through IRB informed consent.",
          });
        }

        return {
          ...result,
          profileKey,
          fullName: input.fullName,
        };
      }),

    submit: publicProcedure
      .input(
        z.object({
          studyId: z.number(),
          profileKey: z.string(),
          answers: z.record(z.string(), z.string()),
        })
      )
      .mutation(async ({ input }) => {
        const profile = await getParticipantProfileByKey(input.profileKey);
        if (!profile) {
          throw new Error("Please complete your universal profile before applying.");
        }

        const result = await submitApplicationWithScreener({
          studyId: input.studyId,
          profileId: profile.id,
          answers: input.answers,
        });

        if (result.passed) {
          await addStudyReminder({
            applicationId: result.applicationId,
            profileKey: input.profileKey,
            title: "Study Coordinator Outreach & Consent Review",
            scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            channel: "in_app",
            notes: "Expect a coordinator call/email to confirm your screening answers and walk through IRB informed consent.",
          });
        }

        return result;
      }),
  }),

  /* ==================== PARTICIPANT TASKS ==================== */
  tasks: router({
    list: publicProcedure
      .input(z.object({ profileKey: z.string() }))
      .query(async ({ input }) => {
        return await getTasksForProfile(input.profileKey);
      }),

    complete: publicProcedure
      .input(z.object({ taskId: z.number(), profileKey: z.string() }))
      .mutation(async ({ input }) => {
        return await completeParticipantTask(input.taskId, input.profileKey);
      }),
  }),

  /* ==================== CONSENTS & PRIVACY SETTINGS ==================== */
  consents: router({
    list: publicProcedure
      .input(z.object({ profileKey: z.string() }))
      .query(async ({ input }) => {
        return await getConsentsForProfile(input.profileKey);
      }),

    update: publicProcedure
      .input(
        z.object({
          profileKey: z.string(),
          consentType: z.enum([
            "terms_of_service",
            "privacy_policy",
            "matching_communications",
            "transactional_email",
            "marketing_email",
            "sms_opt_in",
          ]),
          isGranted: z.boolean(),
          version: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await updateParticipantConsent(
          input.profileKey,
          input.consentType,
          input.isGranted,
          input.version
        );
      }),
  }),

  /* ==================== IN-APP NOTIFICATIONS ==================== */
  notifications: router({
    list: publicProcedure
      .input(z.object({ profileKey: z.string() }))
      .query(async ({ input }) => {
        return await getNotificationsForProfile(input.profileKey);
      }),

    unreadCount: publicProcedure
      .input(z.object({ profileKey: z.string() }))
      .query(async ({ input }) => {
        const notifs = await getNotificationsForProfile(input.profileKey);
        return notifs.filter((n) => !n.isRead).length;
      }),

    markRead: publicProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        return await markNotificationRead(input.notificationId);
      }),

    markAllRead: publicProcedure
      .input(z.object({ profileKey: z.string() }))
      .mutation(async ({ input }) => {
        return await markAllNotificationsRead(input.profileKey);
      }),
  }),

  /* ==================== RESEARCHER PORTAL ROUTER ==================== */
  researcher: router({
    dashboardOverview: publicProcedure
      .input(
        z
          .object({
            studyId: z.number().optional(),
            studySlug: z.string().optional(),
            status: z.string().optional(),
            search: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        const allStudies = await getAllStudies();
        let effectiveStudyId = input?.studyId;
        if (!effectiveStudyId && input?.studySlug && input.studySlug !== "all") {
          const matched = allStudies.find((s) => s.slug === input.studySlug);
          if (matched) {
            effectiveStudyId = matched.id;
          }
        }

        const studiesToReturn = effectiveStudyId
          ? allStudies.filter((s) => s.id === effectiveStudyId)
          : allStudies;
        const pipelineApplications = await getApplicationsForResearcher({
          studyId: effectiveStudyId,
          status: input?.status,
          search: input?.search,
        });

        const totalStudies = studiesToReturn.length;
        const totalApplicants = pipelineApplications.length;
        const qualifiedApplicants = pipelineApplications.filter(
          (a) =>
            a.application.status === "eligible_next_step" ||
            a.application.status === "enrolled" ||
            a.application.status === "completed" ||
            a.application.status === "action_needed" ||
            a.application.status === "screener_passed" ||
            a.application.status === "scheduled"
        ).length;
        const screenedOutCount = pipelineApplications.filter(
          (a) => a.application.status === "not_selected" || a.application.status === "screened_out"
        ).length;
        const overdueCount = pipelineApplications.filter((a) => a.isOverdueReview).length;

        const genderBreakdown: Record<string, number> = { male: 0, female: 0, other: 0 };
        const locationBreakdown: Record<string, number> = { urban: 0, suburban: 0, rural: 0 };
        const educationBreakdown: Record<string, number> = {
          high_school_or_less: 0,
          some_college: 0,
          bachelors: 0,
          graduate_degree: 0,
        };

        for (const item of pipelineApplications) {
          const g = item.profile.gender;
          if (g === "male") genderBreakdown.male++;
          else if (g === "female") genderBreakdown.female++;
          else genderBreakdown.other++;

          const env = item.profile.livingEnvironment;
          if (env in locationBreakdown) locationBreakdown[env]++;

          const edu = item.profile.educationLevel;
          if (edu in educationBreakdown) educationBreakdown[edu]++;
        }

        return {
          studies: studiesToReturn,
          pipeline: pipelineApplications,
          stats: {
            totalStudies,
            totalApplicants,
            qualifiedApplicants,
            screenedOutCount,
            overdueCount,
            efficiencyRate:
              totalApplicants > 0
                ? Math.round((qualifiedApplicants / totalApplicants) * 100)
                : 100,
          },
          diversity: {
            genderBreakdown,
            locationBreakdown,
            educationBreakdown,
          },
        };
      }),

    updateStatusWithHistory: publicProcedure
      .input(
        z.object({
          applicationId: z.number(),
          status: z.string(),
          participantFacingNote: z.string().optional(),
          internalStaffNote: z.string().optional(),
          appointmentDate: z.date().optional(),
          assignedCoordinatorId: z.number().optional(),
          assignedCoordinatorName: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await updateApplicationStatusWithAudit({
          applicationId: input.applicationId,
          status: input.status,
          participantFacingNote: input.participantFacingNote,
          internalStaffNote: input.internalStaffNote,
          changedByUserId: ctx.user?.id,
          changedByName: ctx.user?.name || "Study Team",
          appointmentDate: input.appointmentDate,
          assignedCoordinatorId: input.assignedCoordinatorId,
          assignedCoordinatorName: input.assignedCoordinatorName,
        });
      }),

    assignCoordinator: publicProcedure
      .input(
        z.object({
          applicationId: z.number(),
          coordinatorId: z.number(),
          coordinatorName: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await assignCoordinatorToApplication(
          input.applicationId,
          input.coordinatorId,
          input.coordinatorName
        );
      }),

    createTask: publicProcedure
      .input(
        z.object({
          profileKey: z.string(),
          applicationId: z.number().optional(),
          title: z.string().min(3),
          description: z.string().min(5),
          taskType: z.enum([
            "complete_profile",
            "finish_screener",
            "confirm_contact",
            "confirm_availability",
            "review_study_details",
            "contact_support",
            "custom_request",
          ]).default("custom_request"),
          dueDate: z.date().optional(),
          actionUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        return await createParticipantTask({
          profileKey: input.profileKey,
          applicationId: input.applicationId,
          title: input.title,
          description: input.description,
          taskType: input.taskType,
          dueDate: input.dueDate,
          actionUrl: input.actionUrl,
          createdById: ctx.user?.id,
          createdByName: ctx.user?.name || "Study Team",
        });
      }),

    closeRecruitment: publicProcedure
      .input(z.object({ studyId: z.number() }))
      .mutation(async ({ input }) => {
        return await closeStudyRecruitment(input.studyId);
      }),

    // Legacy compatibility
    updateApplicant: publicProcedure
      .input(
        z.object({
          applicationId: z.number(),
          status: z.enum([
            "screener_passed",
            "screened_out",
            "pending_contact",
            "scheduled",
            "enrolled",
            "completed",
            "withdrawn",
          ]),
          researcherNotes: z.string().optional(),
          appointmentDate: z.date().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await updateApplicationStatus(
          input.applicationId,
          input.status,
          input.researcherNotes,
          input.appointmentDate
        );
      }),
  }),

  /* ==================== INTERNAL OPERATIONS & ADMIN ==================== */
  admin: router({
    overview: publicProcedure.query(async () => {
      return await getAdminAnalyticsSummary();
    }),

    auditLog: publicProcedure.query(async () => {
      return await getAdminAuditRecords();
    }),

    toggleStudyStatus: publicProcedure
      .input(z.object({ studyId: z.number(), status: z.enum(["recruiting", "waitlist", "closed"]) }))
      .mutation(async ({ input }) => {
        return await updateStudy(input.studyId, { status: input.status });
      }),
  }),

  /* ==================== B2B MONETIZATION INQUIRIES ==================== */
  inquiries: router({
    submit: publicProcedure
      .input(
        z.object({
          orgName: z.string().min(2),
          contactName: z.string().min(2),
          email: z.string().email(),
          planType: z.enum([
            "starter_saas",
            "institution_pro",
            "enterprise_pharma",
            "featured_sponsor",
          ]),
          estimatedTrialsPerYear: z.number().default(3),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const id = await createOrganizationInquiry(input);
        return { success: true, inquiryId: id };
      }),
  }),
});

export type AppRouter = typeof appRouter;

