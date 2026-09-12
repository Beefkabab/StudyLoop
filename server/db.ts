import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import crypto from "crypto";
import {
  InsertParticipantProfile,
  InsertStudy,
  InsertStudyApplication,
  InsertScreenerQuestion,
  InsertOrganizationInquiry,
  InsertUser,
  participantProfiles,
  screenerQuestions,
  studies,
  studyApplications,
  organizationInquiries,
  savedStudies,
  studyReminders,
  users,
  Study,
  ParticipantProfile,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;
  if (!storedHash.includes(":")) {
    const legacyHash = crypto
      .createHash("sha256")
      .update(password + (process.env.JWT_SECRET || "studyloop_salt"))
      .digest("hex");
    return crypto.timingSafeEqual(Buffer.from(legacyHash), Buffer.from(storedHash));
  }
  const [salt, key] = storedHash.split(":");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(key, "hex");
  if (derivedKey.length !== keyBuffer.length) return false;
  return crypto.timingSafeEqual(derivedKey, keyBuffer);
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "username", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.username, username.trim().toLowerCase())).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function authenticateLocalUser(username: string, passwordPlain: string) {
  const db = await getDb();
  if (!db) return undefined;
  const user = await getUserByUsername(username);
  if (!user || !user.passwordHash) return undefined;
  if (!verifyPassword(passwordPlain, user.passwordHash)) return undefined;
  return user;
}

export async function registerLocalUser(data: {
  username: string;
  passwordPlain: string;
  name: string;
  email: string;
  role?: "user" | "researcher";
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await getUserByUsername(data.username);
  if (existing) {
    throw new Error("Username already taken. Please choose another.");
  }
  const openId = "local_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const hash = hashPassword(data.passwordPlain);
  await db.insert(users).values({
    openId,
    username: data.username.trim().toLowerCase(),
    passwordHash: hash,
    name: data.name,
    email: data.email,
    loginMethod: "credentials",
    role: data.role || "user",
    lastSignedIn: new Date(),
  });
  return await getUserByOpenId(openId);
}

/* ==================== STUDIES ==================== */

export async function getAllStudies(options?: {
  studyType?: string;
  isHealthyOnly?: boolean;
  search?: string;
  locationType?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (options?.studyType && options.studyType !== "all") {
    conditions.push(eq(studies.studyType, options.studyType as any));
  }

  if (options?.locationType && options.locationType !== "all") {
    conditions.push(eq(studies.locationType, options.locationType as any));
  }

  if (options?.isHealthyOnly) {
    conditions.push(eq(studies.healthyVolunteersAccepted, true));
  }

  if (options?.search && options.search.trim()) {
    const q = `%${options.search.trim().toLowerCase()}%`;
    conditions.push(
      or(
        ilike(studies.title, q),
        ilike(studies.summary, q),
        ilike(studies.sponsorName, q),
        ilike(studies.city, q)
      )
    );
  }

  const query = db
    .select()
    .from(studies)
    .orderBy(desc(studies.isFeatured), desc(studies.isSponsored), desc(studies.createdAt));

  if (conditions.length > 0) {
    return await query.where(and(...conditions));
  }

  return await query;
}

export async function getStudyBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(studies).where(eq(studies.slug, slug)).limit(1);
  return rows[0];
}

export async function getStudyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db.select().from(studies).where(eq(studies.id, id)).limit(1);
  return rows[0];
}

export async function createStudyWithScreeners(data: {
  study: InsertStudy;
  questions: Array<{
    questionText: string;
    explanation?: string;
    expectedAnswer: string;
    isDisqualifying: boolean;
  }>;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const [studyRes] = await db.insert(studies).values(data.study);
  const studyId = studyRes.insertId;

  if (data.questions && data.questions.length > 0) {
    const screenerRows: InsertScreenerQuestion[] = data.questions.map((q, idx) => ({
      studyId,
      orderIndex: idx + 1,
      questionText: q.questionText,
      explanation: q.explanation || null,
      questionType: "yes_no",
      expectedAnswer: q.expectedAnswer,
      isDisqualifying: q.isDisqualifying,
    }));
    await db.insert(screenerQuestions).values(screenerRows);
  }

  return studyId;
}

export async function updateStudy(studyId: number, data: Partial<InsertStudy>) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  await db.update(studies).set(data).where(eq(studies.id, studyId));
  return await getStudyById(studyId);
}

export async function getStudyScreenerQuestions(studyId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(screenerQuestions)
    .where(eq(screenerQuestions.studyId, studyId))
    .orderBy(screenerQuestions.orderIndex);
}

/* ==================== PARTICIPANT PROFILES ==================== */

export async function upsertParticipantProfile(data: InsertParticipantProfile) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const existing = await db
    .select()
    .from(participantProfiles)
    .where(eq(participantProfiles.profileKey, data.profileKey))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(participantProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(participantProfiles.profileKey, data.profileKey));
    return existing[0].id;
  } else {
    const [result] = await db.insert(participantProfiles).values(data);
    return result.insertId;
  }
}

export async function getParticipantProfileByKey(profileKey: string) {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(participantProfiles)
    .where(eq(participantProfiles.profileKey, profileKey))
    .limit(1);
  return rows[0];
}

/* ==================== SAVED STUDIES & BOOKMARKS ==================== */

export async function toggleSaveStudy(profileKey: string, studyId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const existing = await db
    .select()
    .from(savedStudies)
    .where(and(eq(savedStudies.profileKey, profileKey), eq(savedStudies.studyId, studyId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(savedStudies).where(eq(savedStudies.id, existing[0].id));
    return { saved: false };
  } else {
    await db.insert(savedStudies).values({ profileKey, studyId });
    return { saved: true };
  }
}

export async function getSavedStudiesForProfile(profileKey: string) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({
      saved: savedStudies,
      study: studies,
    })
    .from(savedStudies)
    .innerJoin(studies, eq(savedStudies.studyId, studies.id))
    .where(eq(savedStudies.profileKey, profileKey))
    .orderBy(desc(savedStudies.createdAt));
  return rows.map((r) => r.study);
}

/* ==================== PARTICIPANT APPLICATIONS TRACKER ==================== */

export async function getParticipantApplications(profileKey: string) {
  const db = await getDb();
  if (!db) return [];
  const profile = await getParticipantProfileByKey(profileKey);
  if (!profile) return [];

  return await db
    .select({
      application: studyApplications,
      study: studies,
    })
    .from(studyApplications)
    .innerJoin(studies, eq(studyApplications.studyId, studies.id))
    .where(eq(studyApplications.profileId, profile.id))
    .orderBy(desc(studyApplications.createdAt));
}

/* ==================== REMINDERS ==================== */

export async function addStudyReminder(data: {
  applicationId: number;
  profileKey: string;
  title: string;
  scheduledFor: Date;
  channel?: "sms" | "email" | "in_app";
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [res] = await db.insert(studyReminders).values({
    applicationId: data.applicationId,
    profileKey: data.profileKey,
    title: data.title,
    scheduledFor: data.scheduledFor,
    channel: data.channel || "in_app",
    notes: data.notes || null,
  });
  return res.insertId;
}

export async function getRemindersForProfile(profileKey: string) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(studyReminders)
    .where(eq(studyReminders.profileKey, profileKey))
    .orderBy(desc(studyReminders.scheduledFor));
}

/* ==================== MATCHING ENGINE ==================== */

export function calculateMatchScore(study: Study, profile: ParticipantProfile): {
  score: number;
  matchReasons: string[];
  flags: string[];
} {
  let score = 50;
  const matchReasons: string[] = [];
  const flags: string[] = [];

  // Age match
  if (profile.age >= study.minAge && profile.age <= study.maxAge) {
    score += 15;
    matchReasons.push(`Age ${profile.age} is within target bracket (${study.minAge}–${study.maxAge} yrs)`);
  } else {
    score -= 30;
    flags.push(`Age ${profile.age} outside preferred window (${study.minAge}–${study.maxAge} yrs)`);
  }

  // Gender match
  if (study.targetGender === "all") {
    score += 10;
  } else if (study.targetGender === profile.gender) {
    score += 20;
    matchReasons.push(`Priority match: study is actively recruiting ${study.targetGender} participants`);
  } else {
    score -= 25;
    flags.push(`Study specifically seeks ${study.targetGender} participants`);
  }

  // Healthy Volunteer status
  if (profile.isHealthyVolunteer) {
    if (study.healthyVolunteersAccepted) {
      score += 15;
      matchReasons.push("Healthy volunteers are welcomed and eligible");
    } else {
      score -= 20;
      flags.push("Study requires specific diagnosed conditions");
    }
  } else {
    const profileConditions = (profile.conditions as string[]) || [];
    const requiredConditions = (study.requiredConditions as string[]) || [];
    const excludedConditions = (study.excludedConditions as string[]) || [];

    const hasRequired = requiredConditions.some((rc) =>
      profileConditions.some((pc) => pc.toLowerCase().includes(rc.toLowerCase()))
    );
    const hasExcluded = excludedConditions.some((ec) =>
      profileConditions.some((pc) => pc.toLowerCase().includes(ec.toLowerCase()))
    );

    if (hasRequired) {
      score += 25;
      matchReasons.push("Diagnosed condition directly aligns with study focus");
    }
    if (hasExcluded) {
      score -= 30;
      flags.push("User has an exclusion condition listed by study protocol");
    }
  }

  // Location / Environment matching
  if (study.locationType === "remote") {
    score += 10;
    matchReasons.push("100% Remote / Observational - participate from anywhere");
  } else {
    if (
      profile.city.toLowerCase() === study.city.toLowerCase() ||
      profile.state.toLowerCase() === study.state.toLowerCase()
    ) {
      score += 15;
      matchReasons.push(`Local site in ${study.city}, ${study.state}`);
    } else {
      score -= 10;
      flags.push(`Site is in ${study.city}, ${study.state} (Requires travel)`);
    }
  }

  // Underrepresented demographic bonus
  if (
    study.targetDemographicFocus &&
    (profile.livingEnvironment === "rural" ||
      profile.educationLevel === "high_school_or_less" ||
      (study.targetGender === "all" && profile.gender === "male"))
  ) {
    score += 15;
    matchReasons.push("High-priority match for study diversity & representation goals");
  }

  score = Math.max(10, Math.min(99, score));

  return {
    score,
    matchReasons,
    flags,
  };
}

/* ==================== APPLICATIONS & SCREENERS ==================== */

export async function submitApplicationWithScreener(data: {
  studyId: number;
  profileId: number;
  answers: Record<string, string>;
}) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  const questions = await getStudyScreenerQuestions(data.studyId);
  let passed = true;
  const disqualifications: string[] = [];

  for (const q of questions) {
    const rawAnswer = data.answers[q.id.toString()];
    const userAnswer = (rawAnswer || "").trim().toLowerCase();
    const expected = q.expectedAnswer.trim().toLowerCase();

    if (!rawAnswer || userAnswer === "") {
      passed = false;
      disqualifications.push(`Missing required response for question: ${q.questionText}`);
    } else if (q.isDisqualifying && userAnswer !== expected) {
      passed = false;
      disqualifications.push(
        q.disqualificationReason || `Disqualified on question: ${q.questionText}`
      );
    }
  }

  const status = passed ? "screener_passed" : "screened_out";
  const qualificationScore = passed ? 100 : Math.max(20, 100 - disqualifications.length * 30);

  const [res] = await db.insert(studyApplications).values({
    studyId: data.studyId,
    profileId: data.profileId,
    status,
    screenerResponses: data.answers,
    qualificationScore,
    disqualificationNotes: disqualifications.join(" | ") || null,
  });

  return {
    applicationId: res.insertId,
    passed,
    status,
    disqualifications,
  };
}

export async function getApplicationsForResearcher(options?: {
  studyId?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const baseQuery = db
    .select({
      application: studyApplications,
      study: studies,
      profile: participantProfiles,
    })
    .from(studyApplications)
    .innerJoin(studies, eq(studyApplications.studyId, studies.id))
    .innerJoin(participantProfiles, eq(studyApplications.profileId, participantProfiles.id))
    .orderBy(desc(studyApplications.createdAt));

  const conditions = [];
  if (options?.studyId) {
    conditions.push(eq(studyApplications.studyId, options.studyId));
  }
  if (options?.status && options.status !== "all") {
    conditions.push(eq(studyApplications.status, options.status as any));
  }

  if (conditions.length > 0) {
    return await baseQuery.where(and(...conditions));
  }

  return await baseQuery;
}

export async function updateApplicationStatus(
  applicationId: number,
  status: any,
  researcherNotes?: string,
  appointmentDate?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");

  await db
    .update(studyApplications)
    .set({
      status,
      researcherNotes: researcherNotes ?? undefined,
      appointmentDate: appointmentDate ?? undefined,
      updatedAt: new Date(),
    })
    .where(eq(studyApplications.id, applicationId));

  return { success: true };
}

/* ==================== INQUIRIES ==================== */

export async function createOrganizationInquiry(data: InsertOrganizationInquiry) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [res] = await db.insert(organizationInquiries).values(data);
  return res.insertId;
}
