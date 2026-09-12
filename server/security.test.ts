import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./db";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Security & Cryptographic Controls", () => {
  it("generates unique salted scrypt hashes and verifies correctly", () => {
    const password = "ClinicalStudyPassword2026!";
    const hash1 = hashPassword(password);
    const hash2 = hashPassword(password);

    // Each call must use a unique random salt
    expect(hash1).not.toBe(hash2);
    expect(hash1).toContain(":");
    expect(hash2).toContain(":");

    // Correct password verifies against both
    expect(verifyPassword(password, hash1)).toBe(true);
    expect(verifyPassword(password, hash2)).toBe(true);

    // Wrong password fails
    expect(verifyPassword("WrongPassword123", hash1)).toBe(false);
    expect(verifyPassword("", hash1)).toBe(false);
  });

  it("verifies legacy sha256 hashes gracefully", () => {
    // Test backwards compatibility if a legacy un-salted hash exists
    const password = "legacy_password";
    const legacyHash = require("crypto")
      .createHash("sha256")
      .update(password + "studyloop_salt")
      .digest("hex");

    expect(verifyPassword(password, legacyHash)).toBe(true);
    expect(verifyPassword("wrong_password", legacyHash)).toBe(false);
  });
});

describe("Screener Data Minimization & Integrity", () => {
  it("ensures getBySlug strips expected answers and disqualification rules", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const study = await caller.studies.getBySlug({ slug: "healthy-aging-multi-sensory" });
    if (study && study.screenerQuestions && study.screenerQuestions.length > 0) {
      for (const question of study.screenerQuestions) {
        // Must NEVER leak the expected answer or disqualification rule to participant clients
        expect(question).not.toHaveProperty("expectedAnswer");
        expect(question).not.toHaveProperty("isDisqualifying");
        expect(question).not.toHaveProperty("disqualificationReason");

        // Must still have necessary participant-facing UI fields
        expect(question).toHaveProperty("id");
        expect(question).toHaveProperty("questionText");
        expect(question).toHaveProperty("questionType");
      }
    }
  });

  it("disqualifies applicants who omit or pass empty screener answers", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const study = await caller.studies.getBySlug({ slug: "healthy-aging-multi-sensory" });
    if (study && study.id) {
      // Intentionally supply empty / omitted answers to attempt bypass
      const result = await caller.applications.evaluateScreener({
        studyId: study.id,
        answers: {}, // empty answers
      });

      expect(result.passed).toBe(false);
      expect(result.disqualifications.length).toBeGreaterThan(0);
      expect(result.disqualifications[0]).toContain("Missing required response");
    }
  });
});
