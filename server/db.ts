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
  InsertParticipantTask,
  InsertParticipantConsent,
  InsertNotification,
  InsertApplicationStatusHistory,
  participantProfiles,
  screenerQuestions,
  studies,
  studyApplications,
  organizationInquiries,
  savedStudies,
  studyReminders,
  users,
  applicationStatusHistory,
  participantTasks,
  participantConsents,
  notifications,
  organizations,
  organizationMembers,
  analyticsEvents,
  Study,
  ParticipantProfile,
  StudyApplication,
  ApplicationStatusHistory,
  ParticipantTask,
  ParticipantConsent,
  Notification,
  Organization,
  OrganizationMember,
  AnalyticsEvent,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import {
  DEMO_STUDIES,
  DEMO_SCREENER_QUESTIONS,
  DEMO_ORGANIZATIONS,
  DEMO_ORGANIZATION_MEMBERS,
  DEMO_PARTICIPANT_PROFILES,
  DEMO_APPLICATIONS,
  DEMO_STATUS_HISTORY,
  DEMO_TASKS,
  DEMO_CONSENTS,
  DEMO_NOTIFICATIONS,
} from "./demoData";

/* ==================== RESILIENT IN-MEMORY STORES ==================== */
export const memoryStudies = new Map<number, Study>(DEMO_STUDIES.map((s) => [s.id, { ...s }]));
export const memoryProfiles = new Map<string, ParticipantProfile>(
  DEMO_PARTICIPANT_PROFILES.map((p) => [p.profileKey, { ...p }])
);
export const memoryApplications = new Map<number, StudyApplication>(
  DEMO_APPLICATIONS.map((a) => [a.id, { ...a }])
);
export const memoryStatusHistory: ApplicationStatusHistory[] = [...DEMO_STATUS_HISTORY];
export const memoryTasks = new Map<number, ParticipantTask>(
  DEMO_TASKS.map((t) => [t.id, { ...t }])
);
export const memoryConsents: ParticipantConsent[] = [...DEMO_CONSENTS];
export const memoryNotifications = new Map<number, Notification>(
  DEMO_NOTIFICATIONS.map((n) => [n.id, { ...n }])
);
export const memoryOrganizations = new Map<number, Organization>(
  DEMO_ORGANIZATIONS.map((o) => [o.id, { ...o }])
);
export const memoryOrgMembers: OrganizationMember[] = [...DEMO_ORGANIZATION_MEMBERS];
export const memoryAnalyticsEvents: AnalyticsEvent[] = [];

let _nextAppId = 100;
let _nextTaskId = 100;
let _nextConsentId = 100;
let _nextNotifId = 100;
let _nextHistoryId = 100;
let _nextAnalyticsId = 100;
let _nextProfileId = 100;
let _nextStudyId = 100;

let _db: ReturnType<typeof drizzle> | null = null;


export async function getDb() {
  if (process.env.USE_MOCK_DATA === "true" || process.env.FORCE_MOCK_DATA === "true") {
    return null;
  }
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

export interface PrecreatedAccount {
  id: number;
  openId: string;
  username: string;
  passwordPlain: string;
  name: string;
  email: string;
  role: "user" | "researcher";
  institution?: string;
  assignedStudySlug?: string;
}

export const PRECREATED_ACCOUNTS: PrecreatedAccount[] = [
  // 1. Precreated User Profile (Volunteer / Participant)
  {
    id: 101,
    openId: "cred_marcus_participant",
    username: "marcus_volunteer",
    passwordPlain: "volunteer123",
    name: "Marcus Davis",
    email: "marcus.davis92@example.com",
    role: "user",
  },
  {
    id: 102,
    openId: "cred_user_profile",
    username: "user_profile",
    passwordPlain: "password123",
    name: "Marcus Davis (Universal Volunteer)",
    email: "volunteer@studyloop.health",
    role: "user",
  },
  // 2. Precreated Institutional SSO PI Profile (Principal Investigator)
  {
    id: 201,
    openId: "cred_pi_whitman",
    username: "pi_whitman",
    passwordPlain: "whitman123",
    name: "Dr. H. Whitman, MD",
    email: "whitman@triangleaging.org",
    role: "researcher",
    institution: "Triangle Center for Aging and Brain Sciences",
    assignedStudySlug: "healthy-aging-sensory-resilience-study",
  },
  {
    id: 202,
    openId: "cred_sso_pi",
    username: "sso_pi_profile",
    passwordPlain: "sso2026",
    name: "Dr. H. Whitman, MD (Institutional SSO)",
    email: "whitman.sso@duke-health.org",
    role: "researcher",
    institution: "Triangle Center for Aging and Brain Sciences",
    assignedStudySlug: "healthy-aging-sensory-resilience-study",
  },
  // Additional Personas
  {
    id: 103,
    openId: "cred_chloe_student",
    username: "chloe_student",
    passwordPlain: "student123",
    name: "Chloe Martinez",
    email: "chloe.m.student@example.edu",
    role: "user",
  },
  {
    id: 104,
    openId: "cred_robert_patient",
    username: "robert_patient",
    passwordPlain: "patient123",
    name: "Robert Chen",
    email: "robert.chen.t2d@example.org",
    role: "user",
  },
  {
    id: 105,
    openId: "cred_evelyn_senior",
    username: "evelyn_senior",
    passwordPlain: "senior123",
    name: "Dr. Evelyn Harper",
    email: "evelyn.harper.retired@example.edu",
    role: "user",
  },
  {
    id: 106,
    openId: "cred_darius_respiratory",
    username: "darius_respiratory",
    passwordPlain: "asthma123",
    name: "Darius Washington",
    email: "darius.washington90@example.com",
    role: "user",
  },
  {
    id: 107,
    openId: "cred_maria_caregiver",
    username: "maria_caregiver",
    passwordPlain: "bilingual123",
    name: "Maria Santos",
    email: "maria.santos.crc@example.org",
    role: "user",
  },
  {
    id: 108,
    openId: "cred_jim_veteran",
    username: "jim_veteran",
    passwordPlain: "veteran123",
    name: "James 'Jim' O'Connor",
    email: "jim.oconnor.usmc@example.com",
    role: "user",
  },
  {
    id: 203,
    openId: "cred_coordinator_sarah",
    username: "coordinator_sarah",
    passwordPlain: "researcher123",
    name: "Sarah Lindquist, CRC",
    email: "sarah.lindquist@triangleresearch.org",
    role: "researcher",
    institution: "Triangle Clinical Trials Operations",
    assignedStudySlug: "all",
  },
  {
    id: 204,
    openId: "cred_pi_vance",
    username: "pi_vance",
    passwordPlain: "vance123",
    name: "Dr. Elena Vance, MD",
    email: "elena.vance@apexpharma.com",
    role: "researcher",
    institution: "Apex Pharma Therapeutics",
    assignedStudySlug: "novel-oral-glp1-glycemic-control-trial",
  },
];

export async function authenticateLocalUser(username: string, passwordPlain: string) {
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = passwordPlain.trim();

  // 1. Check pre-created accounts first for reliable instant access
  const precreated = PRECREATED_ACCOUNTS.find(
    (acc) => acc.username.toLowerCase() === cleanUser && acc.passwordPlain === cleanPass
  );

  const db = await getDb();
  if (db) {
    try {
      const user = await getUserByUsername(cleanUser);
      if (user && user.passwordHash && verifyPassword(passwordPlain, user.passwordHash)) {
        return user;
      }
    } catch (e) {
      console.warn("[Auth] DB lookup error, falling back to precreated:", e);
    }
  }

  // 2. Return precreated account as User object if matched
  if (precreated) {
    return {
      id: precreated.id,
      openId: precreated.openId,
      username: precreated.username,
      passwordHash: "",
      name: precreated.name,
      email: precreated.email,
      loginMethod: "credentials",
      role: precreated.role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
  }

  return undefined;
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
  let result: Study[] = [];

  if (db) {
    try {
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
        result = await query.where(and(...conditions));
      } else {
        result = await query;
      }
    } catch (err) {
      console.warn("[Database] Query failed, falling back to demo catalog:", err);
    }
  }

  // Seamless fallback to demo studies when DB is empty or unavailable (e.g. Render demo deployment)
  if (!result || result.length === 0) {
    let filtered = [...DEMO_STUDIES];
    if (options?.studyType && options.studyType !== "all") {
      filtered = filtered.filter((s) => s.studyType === options.studyType);
    }
    if (options?.locationType && options.locationType !== "all") {
      filtered = filtered.filter((s) => s.locationType === options.locationType);
    }
    if (options?.isHealthyOnly) {
      filtered = filtered.filter((s) => s.healthyVolunteersAccepted);
    }
    if (options?.search && options.search.trim()) {
      const q = options.search.trim().toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.sponsorName.toLowerCase().includes(q)
      );
    }
    result = filtered;
  }

  return result;
}

export async function getStudyBySlug(slug: string) {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(studies).where(eq(studies.slug, slug)).limit(1);
      if (rows.length > 0) return rows[0];
    } catch (e) {
      console.warn("[Database] getStudyBySlug error, using fallback:", e);
    }
  }
  return DEMO_STUDIES.find((s) => s.slug === slug);
}

export async function getStudyById(id: number) {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db.select().from(studies).where(eq(studies.id, id)).limit(1);
      if (rows.length > 0) return rows[0];
    } catch (e) {
      console.warn("[Database] getStudyById error, using fallback:", e);
    }
  }
  return DEMO_STUDIES.find((s) => s.id === id);
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
  if (db) {
    try {
      const rows = await db
        .select()
        .from(screenerQuestions)
        .where(eq(screenerQuestions.studyId, studyId))
        .orderBy(screenerQuestions.orderIndex);
      if (rows && rows.length > 0) return rows;
    } catch (e) {
      console.warn("[Database] getStudyScreenerQuestions error, using fallback:", e);
    }
  }
  return DEMO_SCREENER_QUESTIONS[studyId] || [];
}

/* ==================== PARTICIPANT PROFILES ==================== */

export async function upsertParticipantProfile(data: InsertParticipantProfile) {
  const db = await getDb();
  let profileId = 0;

  if (db) {
    try {
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
        profileId = existing[0].id;
      } else {
        const [result] = await db.insert(participantProfiles).values(data);
        profileId = result.insertId;
      }
    } catch (e) {
      console.warn("[Database] upsertParticipantProfile fallback to memory store:", e);
    }
  }

  // Always keep in-memory store synchronized for instant zero-latency access
  const existingMem = memoryProfiles.get(data.profileKey);
  if (existingMem) {
    const updated: ParticipantProfile = {
      ...existingMem,
      ...data,
      phone: data.phone ?? existingMem.phone,
      zipCode: data.zipCode ?? existingMem.zipCode,
      conditions: (data.conditions as string[]) ?? existingMem.conditions,
      medications: (data.medications as string[]) ?? existingMem.medications,
      accessibilityNeeds: data.accessibilityNeeds ?? existingMem.accessibilityNeeds,
      updatedAt: new Date(),
    };
    memoryProfiles.set(data.profileKey, updated);
    return profileId || updated.id;
  } else {
    profileId = profileId || ++_nextProfileId;
    const newProfile: ParticipantProfile = {
      id: profileId,
      userId: data.userId ?? null,
      profileKey: data.profileKey,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone ?? null,
      age: data.age,
      gender: data.gender,
      educationLevel: data.educationLevel ?? "bachelors",
      livingEnvironment: data.livingEnvironment ?? "suburban",
      city: data.city,
      state: data.state,
      zipCode: data.zipCode ?? null,
      travelDistanceMiles: data.travelDistanceMiles ?? 25,
      isHealthyVolunteer: data.isHealthyVolunteer ?? true,
      conditions: (data.conditions as string[]) ?? [],
      medications: (data.medications as string[]) ?? [],
      hasRecentAntibiotics: data.hasRecentAntibiotics ?? false,
      smokerStatus: data.smokerStatus ?? "never",
      preferredContactMethod: data.preferredContactMethod ?? "email",
      isContactVerified: data.isContactVerified ?? false,
      preferredLocationType: data.preferredLocationType ?? "no_preference",
      preferredLanguage: data.preferredLanguage ?? "English",
      transportationAccess: data.transportationAccess ?? "personal_vehicle",
      accessibilityNeeds: data.accessibilityNeeds ?? null,
      hasCaregiver: data.hasCaregiver ?? false,
      hasInternetSmartphone: data.hasInternetSmartphone ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memoryProfiles.set(data.profileKey, newProfile);
    return profileId;
  }
}

export async function getParticipantProfileByKey(profileKey: string): Promise<ParticipantProfile | undefined> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(participantProfiles)
        .where(eq(participantProfiles.profileKey, profileKey))
        .limit(1);
      if (rows.length > 0) return rows[0];
    } catch (e) {
      console.warn("[Database] getParticipantProfileByKey fallback to memory:", e);
    }
  }
  return memoryProfiles.get(profileKey);
}

export async function getParticipantProfileById(id: number): Promise<ParticipantProfile | undefined> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(participantProfiles)
        .where(eq(participantProfiles.id, id))
        .limit(1);
      if (rows.length > 0) return rows[0];
    } catch (e) {
      console.warn("[Database] getParticipantProfileById fallback to memory:", e);
    }
  }
  for (const p of Array.from(memoryProfiles.values())) {
    if (p.id === id) return p;
  }
  return undefined;
}

/* ==================== SAVED STUDIES & BOOKMARKS ==================== */

export async function toggleSaveStudy(profileKey: string, studyId: number) {
  const db = await getDb();
  if (db) {
    try {
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
    } catch (e) {
      console.warn("[Database] toggleSaveStudy error, falling back to local toggle:", e);
    }
  }
  return { saved: true };
}

export async function getSavedStudiesForProfile(profileKey: string): Promise<Study[]> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select({
          saved: savedStudies,
          study: studies,
        })
        .from(savedStudies)
        .innerJoin(studies, eq(savedStudies.studyId, studies.id))
        .where(eq(savedStudies.profileKey, profileKey))
        .orderBy(desc(savedStudies.createdAt));
      if (rows.length > 0) return rows.map((r) => r.study);
    } catch (e) {
      console.warn("[Database] getSavedStudiesForProfile error:", e);
    }
  }
  return [];
}

/* ==================== PARTICIPANT APPLICATIONS TRACKER ==================== */

export async function getParticipantApplications(profileKey: string): Promise<Array<{ application: StudyApplication; study: Study }>> {
  const profile = await getParticipantProfileByKey(profileKey);
  if (!profile) return [];

  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select({
          application: studyApplications,
          study: studies,
        })
        .from(studyApplications)
        .innerJoin(studies, eq(studyApplications.studyId, studies.id))
        .where(eq(studyApplications.profileId, profile.id))
        .orderBy(desc(studyApplications.createdAt));

      if (rows && rows.length > 0) return rows;
    } catch (e) {
      console.warn("[Database] getParticipantApplications error, using memory fallback:", e);
    }
  }

  // Resilient in-memory fallback
  const results: Array<{ application: StudyApplication; study: Study }> = [];
  const allStudiesList = await getAllStudies();

  for (const app of Array.from(memoryApplications.values())) {
    if (app.profileId === profile.id) {
      const study = allStudiesList.find((s) => s.id === app.studyId);
      if (study) {
        results.push({
          application: { ...app },
          study: { ...study },
        });
      }
    }
  }

  return results.sort((a, b) => b.application.createdAt.getTime() - a.application.createdAt.getTime());
}

export async function getApplicationById(applicationId: number): Promise<{
  application: StudyApplication;
  study: Study;
  profile: ParticipantProfile;
} | undefined> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select({
          application: studyApplications,
          study: studies,
          profile: participantProfiles,
        })
        .from(studyApplications)
        .innerJoin(studies, eq(studyApplications.studyId, studies.id))
        .innerJoin(participantProfiles, eq(studyApplications.profileId, participantProfiles.id))
        .where(eq(studyApplications.id, applicationId))
        .limit(1);
      if (rows.length > 0) return rows[0];
    } catch (e) {
      console.warn("[Database] getApplicationById error, using memory fallback:", e);
    }
  }

  const app = memoryApplications.get(applicationId);
  if (!app) return undefined;
  const study = (await getAllStudies()).find((s) => s.id === app.studyId);
  const profile = await getParticipantProfileById(app.profileId);
  if (!study || !profile) return undefined;

  return { application: app, study, profile };
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
  if (db) {
    try {
      const [res] = await db.insert(studyReminders).values({
        applicationId: data.applicationId,
        profileKey: data.profileKey,
        title: data.title,
        scheduledFor: data.scheduledFor,
        channel: data.channel || "in_app",
        notes: data.notes || null,
      });
      return res.insertId;
    } catch (e) {
      console.warn("[Database] addStudyReminder DB error, saving in memory:", e);
    }
  }
  return Math.floor(Math.random() * 10000);
}

export async function getRemindersForProfile(profileKey: string) {
  const db = await getDb();
  if (db) {
    try {
      return await db
        .select()
        .from(studyReminders)
        .where(eq(studyReminders.profileKey, profileKey))
        .orderBy(desc(studyReminders.scheduledFor));
    } catch (e) {
      console.warn("[Database] getRemindersForProfile error:", e);
    }
  }
  return [];
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
  initialStatus?: any;
}) {
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

  const normalizedStatus = data.initialStatus || (passed ? "submitted" : "not_selected");
  const qualificationScore = passed ? 100 : Math.max(20, 100 - disqualifications.length * 30);
  const now = new Date();
  const profile = await getParticipantProfileById(data.profileId);
  const study = await getStudyById(data.studyId);

  let appId = ++_nextAppId;
  const db = await getDb();

  if (db) {
    try {
      const [res] = await db.insert(studyApplications).values({
        studyId: data.studyId,
        profileId: data.profileId,
        status: normalizedStatus as any,
        screenerResponses: data.answers,
        qualificationScore,
        disqualificationNotes: disqualifications.join(" | ") || null,
        participantFacingNote: passed
          ? "Application submitted. The research team has received your screening details."
          : "Thank you for your application. Based on protocol inclusion criteria, your profile was not selected for this protocol.",
        internalStaffNote: passed
          ? "Pre-screener passed with full score. Pending coordinator intake."
          : `Disqualified criteria: ${disqualifications.join("; ")}`,
        statusUpdatedAt: now,
        createdAt: now,
        updatedAt: now,
      });
      appId = res.insertId;
    } catch (e) {
      console.warn("[Database] submitApplicationWithScreener DB error, writing to memory:", e);
    }
  }

  // Persist into memory store
  const newApp: StudyApplication = {
    id: appId,
    studyId: data.studyId,
    profileId: data.profileId,
    status: normalizedStatus as any,
    screenerResponses: data.answers,
    qualificationScore,
    disqualificationNotes: disqualifications.join(" | ") || null,
    researcherNotes: null,
    participantFacingNote: passed
      ? "Application submitted. The research team has received your screening details."
      : "Thank you for your application. Based on protocol inclusion criteria, your profile was not selected for this protocol.",
    internalStaffNote: passed
      ? "Pre-screener passed with full score. Pending coordinator intake."
      : `Disqualified criteria: ${disqualifications.join("; ")}`,
    assignedCoordinatorId: null,
    assignedCoordinatorName: null,
    statusUpdatedAt: now,
    lastStatusChangedByUserId: null,
    lastStatusChangedByName: "StudyLoop Automated Screener",
    appointmentDate: null,
    createdAt: now,
    updatedAt: now,
  };
  memoryApplications.set(appId, newApp);

  // Record initial Status History
  await recordStatusHistory({
    applicationId: appId,
    fromStatus: null,
    toStatus: normalizedStatus,
    changedByUserId: null,
    changedByName: "StudyLoop Automated Screener",
    participantFacingNote: newApp.participantFacingNote,
    internalNote: newApp.internalStaffNote,
  });

  // Track Analytics Events
  trackAnalyticsEvent("screener_completed", "application", {
    profileKey: profile?.profileKey,
    studyId: data.studyId,
    applicationId: appId,
    metadata: { passed, score: qualificationScore },
  });

  trackAnalyticsEvent("application_submitted", "application", {
    profileKey: profile?.profileKey,
    studyId: data.studyId,
    applicationId: appId,
    metadata: { status: normalizedStatus },
  });

  // Create notification for participant
  if (profile) {
    await createNotification({
      userId: profile.userId,
      profileKey: profile.profileKey,
      eventType: "application_submitted",
      title: `Application Submitted: ${study?.title || "Research Study"}`,
      body: passed
        ? "Your pre-screening application was submitted. The study coordinator will review your profile shortly."
        : "Thank you for applying. We have matched alternative opportunities with your profile.",
      actionUrl: "/my-studies",
      studyId: data.studyId,
      applicationId: appId,
      taskId: null,
      emailAttempted: true,
      emailDelivered: true,
      emailRecipient: profile.email,
      emailDeliveryLog: `[Simulated Delivery] SMTP Status 250 OK - Sent to ${profile.email}`,
    });
  }

  return {
    applicationId: appId,
    passed,
    status: normalizedStatus,
    disqualifications,
  };
}

/* ==================== AUDIT & STATUS HISTORY ==================== */

export async function recordStatusHistory(data: InsertApplicationStatusHistory) {
  const historyId = ++_nextHistoryId;
  const record: ApplicationStatusHistory = {
    id: historyId,
    applicationId: data.applicationId,
    fromStatus: data.fromStatus ?? null,
    toStatus: data.toStatus,
    changedByUserId: data.changedByUserId ?? null,
    changedByName: data.changedByName ?? null,
    participantFacingNote: data.participantFacingNote ?? null,
    internalNote: data.internalNote ?? null,
    createdAt: new Date(),
  };

  const db = await getDb();
  if (db) {
    try {
      await db.insert(applicationStatusHistory).values(record);
    } catch (e) {
      console.warn("[Database] recordStatusHistory DB error:", e);
    }
  }

  memoryStatusHistory.unshift(record);
  return record;
}

export async function getStatusHistoryForApplication(applicationId: number): Promise<ApplicationStatusHistory[]> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(applicationStatusHistory)
        .where(eq(applicationStatusHistory.applicationId, applicationId))
        .orderBy(desc(applicationStatusHistory.createdAt));
      if (rows.length > 0) return rows;
    } catch (e) {
      console.warn("[Database] getStatusHistoryForApplication error, using memory fallback:", e);
    }
  }

  return memoryStatusHistory
    .filter((h) => h.applicationId === applicationId)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/* ==================== STATUS UPDATES (COORDINATOR / RESEARCHER) ==================== */

export async function updateApplicationStatusWithAudit(data: {
  applicationId: number;
  status: any;
  participantFacingNote?: string;
  internalStaffNote?: string;
  changedByUserId?: number;
  changedByName?: string;
  appointmentDate?: Date;
  assignedCoordinatorId?: number;
  assignedCoordinatorName?: string;
}) {
  const current = await getApplicationById(data.applicationId);
  if (!current) throw new Error("Application not found");

  const fromStatus = current.application.status;
  const toStatus = data.status;
  const now = new Date();

  const db = await getDb();
  if (db) {
    try {
      await db
        .update(studyApplications)
        .set({
          status: toStatus,
          participantFacingNote: data.participantFacingNote ?? current.application.participantFacingNote,
          internalStaffNote: data.internalStaffNote ?? current.application.internalStaffNote,
          lastStatusChangedByUserId: data.changedByUserId ?? current.application.lastStatusChangedByUserId,
          lastStatusChangedByName: data.changedByName ?? current.application.lastStatusChangedByName,
          assignedCoordinatorId: data.assignedCoordinatorId ?? current.application.assignedCoordinatorId,
          assignedCoordinatorName: data.assignedCoordinatorName ?? current.application.assignedCoordinatorName,
          appointmentDate: data.appointmentDate ?? current.application.appointmentDate,
          statusUpdatedAt: now,
          updatedAt: now,
        })
        .where(eq(studyApplications.id, data.applicationId));
    } catch (e) {
      console.warn("[Database] updateApplicationStatusWithAudit DB error, updating memory:", e);
    }
  }

  // Update memory
  const memApp = memoryApplications.get(data.applicationId);
  if (memApp) {
    memApp.status = toStatus;
    if (data.participantFacingNote !== undefined) memApp.participantFacingNote = data.participantFacingNote;
    if (data.internalStaffNote !== undefined) memApp.internalStaffNote = data.internalStaffNote;
    if (data.changedByUserId !== undefined) memApp.lastStatusChangedByUserId = data.changedByUserId;
    if (data.changedByName !== undefined) memApp.lastStatusChangedByName = data.changedByName;
    if (data.assignedCoordinatorId !== undefined) memApp.assignedCoordinatorId = data.assignedCoordinatorId;
    if (data.assignedCoordinatorName !== undefined) memApp.assignedCoordinatorName = data.assignedCoordinatorName;
    if (data.appointmentDate !== undefined) memApp.appointmentDate = data.appointmentDate;
    memApp.statusUpdatedAt = now;
    memApp.updatedAt = now;
  }

  // Record history
  await recordStatusHistory({
    applicationId: data.applicationId,
    fromStatus,
    toStatus,
    changedByUserId: data.changedByUserId ?? null,
    changedByName: data.changedByName ?? "Research Team",
    participantFacingNote: data.participantFacingNote ?? null,
    internalNote: data.internalStaffNote ?? null,
  });

  // Track analytics
  trackAnalyticsEvent("status_updated", "researcher_ops", {
    applicationId: data.applicationId,
    studyId: current.study.id,
    metadata: { fromStatus, toStatus, changedByName: data.changedByName },
  });

  // Notify participant of status change
  const eventType = toStatus === "action_needed" ? "action_required" : "status_changed";
  await createNotification({
    userId: current.profile.userId,
    profileKey: current.profile.profileKey,
    eventType,
    title: `Update: ${current.study.title}`,
    body: data.participantFacingNote || `Your application status has been updated to: ${toStatus.replace(/_/g, " ")}.`,
    actionUrl: "/my-studies",
    studyId: current.study.id,
    applicationId: data.applicationId,
    taskId: null,
    emailAttempted: true,
    emailDelivered: true,
    emailRecipient: current.profile.email,
    emailDeliveryLog: `[Simulated Delivery] SMTP Status 250 OK - Sent to ${current.profile.email}`,
  });

  return { success: true, toStatus };
}

// Legacy wrapper
export async function updateApplicationStatus(
  applicationId: number,
  status: any,
  researcherNotes?: string,
  appointmentDate?: Date
) {
  return await updateApplicationStatusWithAudit({
    applicationId,
    status,
    internalStaffNote: researcherNotes,
    appointmentDate,
  });
}

export async function withdrawApplication(
  applicationId: number,
  profileKey: string,
  reason?: string
) {
  const current = await getApplicationById(applicationId);
  if (!current) throw new Error("Application not found");
  if (current.profile.profileKey !== profileKey) {
    throw new Error("Unauthorized: Profile does not match application");
  }

  await updateApplicationStatusWithAudit({
    applicationId,
    status: "withdrawn",
    participantFacingNote: "You have voluntarily withdrawn from this study application.",
    internalStaffNote: `Participant requested withdrawal. Reason: ${reason || "No reason provided"}`,
    changedByName: current.profile.fullName,
  });

  trackAnalyticsEvent("withdrawn", "outcomes", {
    profileKey,
    applicationId,
    studyId: current.study.id,
    metadata: { reason },
  });

  return { success: true };
}

export async function getAlternativeStudiesForParticipant(studyId: number, profileKey?: string): Promise<Study[]> {
  const all = await getAllStudies();
  const filtered = all.filter((s) => s.id !== studyId && s.status === "recruiting");

  if (profileKey) {
    const profile = await getParticipantProfileByKey(profileKey);
    if (profile) {
      return filtered.sort((a, b) => {
        const scoreA = calculateMatchScore(a, profile).score;
        const scoreB = calculateMatchScore(b, profile).score;
        return scoreB - scoreA;
      });
    }
  }

  return filtered;
}

/* ==================== PARTICIPANT TASKS ==================== */

export async function getTasksForProfile(profileKey: string): Promise<ParticipantTask[]> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(participantTasks)
        .where(eq(participantTasks.profileKey, profileKey))
        .orderBy(desc(participantTasks.createdAt));
      if (rows.length > 0) return rows;
    } catch (e) {
      console.warn("[Database] getTasksForProfile error, falling back to memory:", e);
    }
  }

  const results: ParticipantTask[] = [];
  for (const t of Array.from(memoryTasks.values())) {
    if (t.profileKey === profileKey) {
      results.push({ ...t });
    }
  }
  return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function createParticipantTask(data: InsertParticipantTask) {
  const taskId = ++_nextTaskId;
  const now = new Date();

  const record: ParticipantTask = {
    id: taskId,
    applicationId: data.applicationId ?? null,
    profileKey: data.profileKey,
    taskType: data.taskType ?? "custom_request",
    title: data.title,
    description: data.description,
    status: data.status ?? "pending",
    actionUrl: data.actionUrl ?? null,
    dueDate: data.dueDate ?? null,
    completedAt: null,
    createdById: data.createdById ?? null,
    createdByName: data.createdByName ?? "Study Team",
    createdAt: now,
  };

  const db = await getDb();
  if (db) {
    try {
      await db.insert(participantTasks).values(record);
    } catch (e) {
      console.warn("[Database] createParticipantTask DB error:", e);
    }
  }

  memoryTasks.set(taskId, record);

  // Notify participant
  const profile = await getParticipantProfileByKey(data.profileKey);
  if (profile) {
    await createNotification({
      userId: profile.userId,
      profileKey: data.profileKey,
      eventType: "action_required",
      title: `Action Requested: ${data.title}`,
      body: data.description,
      actionUrl: data.actionUrl || "/my-studies",
      studyId: null,
      applicationId: data.applicationId ?? null,
      taskId,
      emailAttempted: true,
      emailDelivered: true,
      emailRecipient: profile.email,
      emailDeliveryLog: `[Simulated Delivery] SMTP Status 250 OK - Sent to ${profile.email}`,
    });
  }

  trackAnalyticsEvent("task_requested", "researcher_ops", {
    profileKey: data.profileKey,
    applicationId: data.applicationId ?? undefined,
    metadata: { title: data.title, taskType: data.taskType },
  });

  return record;
}

export async function completeParticipantTask(taskId: number, profileKey: string) {
  const task = memoryTasks.get(taskId);
  if (!task) throw new Error("Task not found");
  if (task.profileKey !== profileKey) throw new Error("Unauthorized task update");

  const now = new Date();
  task.status = "completed";
  task.completedAt = now;

  const db = await getDb();
  if (db) {
    try {
      await db
        .update(participantTasks)
        .set({ status: "completed", completedAt: now })
        .where(eq(participantTasks.id, taskId));
    } catch (e) {
      console.warn("[Database] completeParticipantTask DB error:", e);
    }
  }

  trackAnalyticsEvent("task_completed", "participant_experience", {
    profileKey,
    applicationId: task.applicationId ?? undefined,
    metadata: { taskId, title: task.title },
  });

  return task;
}

/* ==================== CONSENTS & NOTIFICATION PREFERENCES ==================== */

export async function getConsentsForProfile(profileKey: string): Promise<ParticipantConsent[]> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(participantConsents)
        .where(eq(participantConsents.profileKey, profileKey))
        .orderBy(desc(participantConsents.grantedAt));
      if (rows.length > 0) return rows;
    } catch (e) {
      console.warn("[Database] getConsentsForProfile error:", e);
    }
  }

  const results = memoryConsents.filter((c) => c.profileKey === profileKey);
  if (results.length === 0) {
    // Return standard initial defaults
    const defaults: ParticipantConsent[] = [
      {
        id: ++_nextConsentId,
        profileKey,
        userId: null,
        consentType: "terms_of_service",
        version: "2026.1",
        isGranted: true,
        ipAddress: "127.0.0.1",
        grantedAt: new Date(),
        revokedAt: null,
      },
      {
        id: ++_nextConsentId,
        profileKey,
        userId: null,
        consentType: "privacy_policy",
        version: "2026.1",
        isGranted: true,
        ipAddress: "127.0.0.1",
        grantedAt: new Date(),
        revokedAt: null,
      },
      {
        id: ++_nextConsentId,
        profileKey,
        userId: null,
        consentType: "matching_communications",
        version: "2026.1",
        isGranted: true,
        ipAddress: "127.0.0.1",
        grantedAt: new Date(),
        revokedAt: null,
      },
      {
        id: ++_nextConsentId,
        profileKey,
        userId: null,
        consentType: "transactional_email",
        version: "2026.1",
        isGranted: true,
        ipAddress: "127.0.0.1",
        grantedAt: new Date(),
        revokedAt: null,
      },
      {
        id: ++_nextConsentId,
        profileKey,
        userId: null,
        consentType: "marketing_email",
        version: "2026.1",
        isGranted: false,
        ipAddress: "127.0.0.1",
        grantedAt: new Date(),
        revokedAt: new Date(),
      },
      {
        id: ++_nextConsentId,
        profileKey,
        userId: null,
        consentType: "sms_opt_in",
        version: "2026.1",
        isGranted: false,
        ipAddress: "127.0.0.1",
        grantedAt: new Date(),
        revokedAt: null,
      },
    ];
    memoryConsents.push(...defaults);
    return defaults;
  }
  return results;
}

export async function updateParticipantConsent(
  profileKey: string,
  consentType: any,
  isGranted: boolean,
  version: string = "2026.1"
) {
  const existingIndex = memoryConsents.findIndex(
    (c) => c.profileKey === profileKey && c.consentType === consentType
  );
  const now = new Date();

  if (existingIndex >= 0) {
    memoryConsents[existingIndex].isGranted = isGranted;
    memoryConsents[existingIndex].version = version;
    if (!isGranted) {
      memoryConsents[existingIndex].revokedAt = now;
    } else {
      memoryConsents[existingIndex].grantedAt = now;
      memoryConsents[existingIndex].revokedAt = null;
    }
  } else {
    memoryConsents.push({
      id: ++_nextConsentId,
      profileKey,
      userId: null,
      consentType,
      version,
      isGranted,
      ipAddress: "127.0.0.1",
      grantedAt: now,
      revokedAt: isGranted ? null : now,
    });
  }

  const db = await getDb();
  if (db) {
    try {
      await db.insert(participantConsents).values({
        profileKey,
        consentType,
        version,
        isGranted,
        ipAddress: "127.0.0.1",
        grantedAt: now,
        revokedAt: isGranted ? null : now,
      });
    } catch (e) {
      console.warn("[Database] updateParticipantConsent DB error:", e);
    }
  }

  return { success: true };
}

/* ==================== NOTIFICATIONS ==================== */

export async function getNotificationsForProfile(profileKey: string): Promise<Notification[]> {
  const db = await getDb();
  if (db) {
    try {
      const rows = await db
        .select()
        .from(notifications)
        .where(eq(notifications.profileKey, profileKey))
        .orderBy(desc(notifications.createdAt));
      if (rows.length > 0) return rows;
    } catch (e) {
      console.warn("[Database] getNotificationsForProfile error:", e);
    }
  }

  const results: Notification[] = [];
  for (const n of Array.from(memoryNotifications.values())) {
    if (n.profileKey === profileKey) {
      results.push({ ...n });
    }
  }
  return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function markNotificationRead(id: number) {
  const n = memoryNotifications.get(id);
  if (n) n.isRead = true;

  const db = await getDb();
  if (db) {
    try {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
    } catch (e) {
      console.warn("[Database] markNotificationRead DB error:", e);
    }
  }
  return { success: true };
}

export async function markAllNotificationsRead(profileKey: string) {
  for (const n of Array.from(memoryNotifications.values())) {
    if (n.profileKey === profileKey) n.isRead = true;
  }

  const db = await getDb();
  if (db) {
    try {
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.profileKey, profileKey));
    } catch (e) {
      console.warn("[Database] markAllNotificationsRead DB error:", e);
    }
  }
  return { success: true };
}

export async function createNotification(data: InsertNotification): Promise<Notification> {
  const notifId = ++_nextNotifId;
  const now = new Date();

  const record: Notification = {
    id: notifId,
    userId: data.userId ?? null,
    profileKey: data.profileKey,
    eventType: data.eventType,
    title: data.title,
    body: data.body,
    actionUrl: data.actionUrl ?? null,
    studyId: data.studyId ?? null,
    applicationId: data.applicationId ?? null,
    taskId: data.taskId ?? null,
    isRead: false,
    emailAttempted: data.emailAttempted ?? true,
    emailDelivered: data.emailDelivered ?? true,
    emailRecipient: data.emailRecipient ?? null,
    emailDeliveryLog: data.emailDeliveryLog ?? `[Simulated Delivery] SMTP Status 250 OK`,
    createdAt: now,
  };

  const db = await getDb();
  if (db) {
    try {
      await db.insert(notifications).values(record);
    } catch (e) {
      console.warn("[Database] createNotification DB error:", e);
    }
  }

  memoryNotifications.set(notifId, record);
  return record;
}

/* ==================== RESEARCHER APPLICATION PIPELINE ==================== */

export async function getApplicationsForResearcher(options?: {
  studyId?: number;
  status?: string;
  coordinatorId?: number;
  search?: string;
}) {
  const allStudiesList = await getAllStudies();
  const allProfilesList = Array.from(memoryProfiles.values());
  const allAppsList = Array.from(memoryApplications.values());

  let results: Array<{
    application: StudyApplication;
    study: Study;
    profile: ParticipantProfile;
    isOverdueReview: boolean;
  }> = [];

  const db = await getDb();
  if (db) {
    try {
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

      const rows = conditions.length > 0 ? await baseQuery.where(and(...conditions)) : await baseQuery;
      if (rows && rows.length > 0) {
        results = rows.map((r) => {
          const hoursAgo = (Date.now() - new Date(r.application.createdAt).getTime()) / (1000 * 60 * 60);
          const isOverdue = (r.application.status === "submitted" || r.application.status === "under_review") && hoursAgo > 48;
          return {
            ...r,
            isOverdueReview: isOverdue,
          };
        });
      }
    } catch (e) {
      console.warn("[Database] getApplicationsForResearcher error, using memory fallback:", e);
    }
  }

  if (results.length === 0) {
    for (const app of allAppsList) {
      if (options?.studyId && app.studyId !== options.studyId) continue;
      if (options?.status && options.status !== "all" && app.status !== options.status) continue;
      if (options?.coordinatorId && app.assignedCoordinatorId !== options.coordinatorId) continue;

      const study = allStudiesList.find((s) => s.id === app.studyId);
      const profile = allProfilesList.find((p) => p.id === app.profileId);

      if (study && profile) {
        const hoursAgo = (Date.now() - app.createdAt.getTime()) / (1000 * 60 * 60);
        const isOverdue = (app.status === "submitted" || app.status === "under_review") && hoursAgo > 48;

        results.push({
          application: { ...app },
          study: { ...study },
          profile: { ...profile },
          isOverdueReview: isOverdue,
        });
      }
    }
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.trim().toLowerCase();
    results = results.filter(
      (r) =>
        r.profile.fullName.toLowerCase().includes(q) ||
        r.profile.city.toLowerCase().includes(q) ||
        r.study.title.toLowerCase().includes(q)
    );
  }

  return results.sort((a, b) => b.application.createdAt.getTime() - a.application.createdAt.getTime());
}

export async function assignCoordinatorToApplication(
  applicationId: number,
  coordinatorId: number,
  coordinatorName: string
) {
  return await updateApplicationStatusWithAudit({
    applicationId,
    status: (memoryApplications.get(applicationId)?.status || "under_review") as any,
    assignedCoordinatorId: coordinatorId,
    assignedCoordinatorName: coordinatorName,
    internalStaffNote: `Assigned to coordinator: ${coordinatorName}`,
    changedByName: "Lead PI / Study Manager",
  });
}

export async function closeStudyRecruitment(studyId: number) {
  await updateStudy(studyId, { status: "closed" });

  const appList = Array.from(memoryApplications.values()).filter((a) => a.studyId === studyId);
  for (const app of appList) {
    if (app.status !== "enrolled" && app.status !== "completed") {
      await updateApplicationStatusWithAudit({
        applicationId: app.id,
        status: "study_closed",
        participantFacingNote: "Recruitment for this protocol has closed. We invite you to explore related studies open for enrollment.",
        internalStaffNote: "Study enrollment target met or recruitment closed by protocol sponsor.",
        changedByName: "Study Manager",
      });
    }
  }

  trackAnalyticsEvent("study_closed", "outcomes", {
    studyId,
    metadata: { closedAt: new Date() },
  });

  return { success: true };
}

/* ==================== ADMIN & OPERATIONS TOOLS ==================== */

export async function getAdminAuditRecords() {
  return {
    statusHistory: memoryStatusHistory.slice(0, 50),
    consents: memoryConsents.slice(0, 50),
    analyticsEvents: memoryAnalyticsEvents.slice(0, 50),
  };
}

export async function getAdminAnalyticsSummary() {
  const allApps = Array.from(memoryApplications.values());
  const allStudies = await getAllStudies();

  const totalApplications = allApps.length;
  const enrolledCount = allApps.filter((a) => a.status === "enrolled").length;
  const completedCount = allApps.filter((a) => a.status === "completed").length;
  const notSelectedCount = allApps.filter((a) => a.status === "not_selected").length;
  const inReviewCount = allApps.filter((a) => a.status === "under_review" || a.status === "submitted").length;
  const actionNeededCount = allApps.filter((a) => a.status === "action_needed").length;

  const allTasks = Array.from(memoryTasks.values());
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.status === "completed").length;

  return {
    totalStudies: allStudies.length,
    totalApplications,
    enrolledCount,
    completedCount,
    notSelectedCount,
    inReviewCount,
    actionNeededCount,
    taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100,
    conversionRate: totalApplications > 0 ? Math.round((enrolledCount / totalApplications) * 100) : 0,
    organizationsCount: memoryOrganizations.size,
  };
}

/* ==================== ANALYTICS EVENT TRACKER ==================== */

export function trackAnalyticsEvent(
  eventType: string,
  funnelStage: "discovery" | "application" | "participant_experience" | "researcher_ops" | "outcomes" | "quality",
  data: {
    userId?: number;
    profileKey?: string;
    studyId?: number;
    applicationId?: number;
    metadata?: Record<string, any>;
  }
) {
  const eventId = ++_nextAnalyticsId;
  const event: AnalyticsEvent = {
    id: eventId,
    eventType,
    funnelStage,
    userId: data.userId ?? null,
    profileKey: data.profileKey ?? null,
    studyId: data.studyId ?? null,
    applicationId: data.applicationId ?? null,
    metadata: data.metadata ?? {},
    createdAt: new Date(),
  };

  memoryAnalyticsEvents.unshift(event);

  // Async insert to DB if available
  getDb().then((db) => {
    if (db) {
      db.insert(analyticsEvents).values(event).catch(() => {});
    }
  });

  return event;
}

/* ==================== INQUIRIES ==================== */

export async function createOrganizationInquiry(data: InsertOrganizationInquiry) {
  const db = await getDb();
  if (db) {
    try {
      const [res] = await db.insert(organizationInquiries).values(data);
      return res.insertId;
    } catch (e) {
      console.warn("[Database] createOrganizationInquiry DB error:", e);
    }
  }
  return Math.floor(Math.random() * 1000);
}

