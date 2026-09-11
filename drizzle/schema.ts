import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with username and passwordHash for dedicated multi-user credential sign-in.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  username: varchar("username", { length: 64 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "researcher", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Universal Participant Profile (Demographics + Baseline Health)
 * "Create a profile once, receive personalized recommendations"
 */
export const participantProfiles = mysqlTable("participant_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  profileKey: varchar("profileKey", { length: 64 }).notNull().unique(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  age: int("age").notNull(),
  gender: mysqlEnum("gender", ["female", "male", "non_binary", "prefer_not_to_say"]).notNull(),
  educationLevel: mysqlEnum("educationLevel", ["high_school_or_less", "some_college", "bachelors", "graduate_degree"]).default("bachelors").notNull(),
  livingEnvironment: mysqlEnum("livingEnvironment", ["urban", "suburban", "rural"]).default("suburban").notNull(),
  city: varchar("city", { length: 128 }).notNull(),
  state: varchar("state", { length: 64 }).notNull(),
  zipCode: varchar("zipCode", { length: 20 }),
  travelDistanceMiles: int("travelDistanceMiles").default(25).notNull(),
  isHealthyVolunteer: boolean("isHealthyVolunteer").default(true).notNull(),
  conditions: json("conditions").$type<string[]>(), // e.g. ["Asthma", "Type 2 Diabetes", "Mild Cognitive Impairment"]
  medications: json("medications").$type<string[]>(),
  hasRecentAntibiotics: boolean("hasRecentAntibiotics").default(false).notNull(),
  smokerStatus: mysqlEnum("smokerStatus", ["never", "former", "current"]).default("never").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ParticipantProfile = typeof participantProfiles.$inferSelect;
export type InsertParticipantProfile = typeof participantProfiles.$inferInsert;

/**
 * Research Studies
 * Marketplace offerings: clinical trials, observational/surveys, blood draws, imaging studies
 */
export const studies = mysqlTable("studies", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  sponsorName: varchar("sponsorName", { length: 255 }).notNull(),
  sponsorType: mysqlEnum("sponsorType", ["university", "hospital", "biotech", "pharma", "research_center"]).notNull(),
  piName: varchar("piName", { length: 255 }).notNull(), // Principal Investigator
  piTitle: varchar("piTitle", { length: 255 }),
  studyType: mysqlEnum("studyType", ["clinical_trial", "blood_draw", "observational_survey", "imaging_mri", "cognitive_assessment"]).notNull(),
  compensationAmount: int("compensationAmount").notNull(), // in USD
  compensationType: varchar("compensationType", { length: 64 }).default("Direct Payment (Stipend)").notNull(),
  compensationSchedule: text("compensationSchedule"),
  timeCommitment: varchar("timeCommitment", { length: 128 }).notNull(),
  durationWeeks: int("durationWeeks").default(1),
  locationType: mysqlEnum("locationType", ["in_person", "remote", "hybrid"]).notNull(),
  city: varchar("city", { length: 128 }).notNull(),
  state: varchar("state", { length: 64 }).notNull(),
  facilityAddress: text("facilityAddress"),
  summary: text("summary").notNull(),
  fullDescription: text("fullDescription").notNull(),
  irbApprovalNumber: varchar("irbApprovalNumber", { length: 64 }).default("IRB-2026-0894").notNull(),
  targetEnrollment: int("targetEnrollment").default(50).notNull(),
  currentEnrolled: int("currentEnrolled").default(0).notNull(),
  
  // Criteria
  minAge: int("minAge").default(18).notNull(),
  maxAge: int("maxAge").default(85).notNull(),
  targetGender: mysqlEnum("targetGender", ["all", "male", "female"]).default("all").notNull(),
  healthyVolunteersAccepted: boolean("healthyVolunteersAccepted").default(true).notNull(),
  requiredConditions: json("requiredConditions").$type<string[]>(),
  excludedConditions: json("excludedConditions").$type<string[]>(),
  targetDemographicFocus: varchar("targetDemographicFocus", { length: 255 }),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isSponsored: boolean("isSponsored").default(false).notNull(),
  status: mysqlEnum("status", ["recruiting", "waitlist", "closed"]).default("recruiting").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Study = typeof studies.$inferSelect;
export type InsertStudy = typeof studies.$inferInsert;

/**
 * Dynamic Pre-Screener Questions configured per study
 */
export const screenerQuestions = mysqlTable("screener_questions", {
  id: int("id").autoincrement().primaryKey(),
  studyId: int("studyId").notNull(),
  orderIndex: int("orderIndex").notNull(),
  questionText: text("questionText").notNull(),
  explanation: text("explanation"),
  questionType: mysqlEnum("questionType", ["yes_no", "multiple_choice", "single_choice", "number"]).notNull(),
  options: json("options").$type<string[]>(),
  expectedAnswer: varchar("expectedAnswer", { length: 255 }).notNull(),
  isDisqualifying: boolean("isDisqualifying").default(true).notNull(),
  disqualificationReason: text("disqualificationReason"),
});

export type ScreenerQuestion = typeof screenerQuestions.$inferSelect;
export type InsertScreenerQuestion = typeof screenerQuestions.$inferInsert;

/**
 * Study Applications & Pre-Screening Results
 */
export const studyApplications = mysqlTable("study_applications", {
  id: int("id").autoincrement().primaryKey(),
  studyId: int("studyId").notNull(),
  profileId: int("profileId").notNull(),
  status: mysqlEnum("status", [
    "screener_passed", 
    "screened_out", 
    "pending_contact", 
    "scheduled", 
    "enrolled", 
    "completed", 
    "withdrawn"
  ]).default("screener_passed").notNull(),
  screenerResponses: json("screenerResponses").$type<Record<string, any>>().notNull(),
  qualificationScore: int("qualificationScore").default(100).notNull(),
  disqualificationNotes: text("disqualificationNotes"),
  researcherNotes: text("researcherNotes"),
  appointmentDate: timestamp("appointmentDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudyApplication = typeof studyApplications.$inferSelect;
export type InsertStudyApplication = typeof studyApplications.$inferInsert;

/**
 * Saved / Bookmarked Studies by Participants
 */
export const savedStudies = mysqlTable("saved_studies", {
  id: int("id").autoincrement().primaryKey(),
  profileKey: varchar("profileKey", { length: 64 }).notNull(),
  studyId: int("studyId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedStudy = typeof savedStudies.$inferSelect;
export type InsertSavedStudy = typeof savedStudies.$inferInsert;

/**
 * Participant Visit & Follow-Up Reminders
 */
export const studyReminders = mysqlTable("study_reminders", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  profileKey: varchar("profileKey", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  scheduledFor: timestamp("scheduledFor").notNull(),
  channel: mysqlEnum("channel", ["sms", "email", "in_app"]).default("in_app").notNull(),
  notes: text("notes"),
  isSent: boolean("isSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type StudyReminder = typeof studyReminders.$inferSelect;
export type InsertStudyReminder = typeof studyReminders.$inferInsert;

/**
 * B2B Subscription & Sponsorship inquiries
 */
export const organizationInquiries = mysqlTable("organization_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  orgName: varchar("orgName", { length: 255 }).notNull(),
  contactName: varchar("contactName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  planType: mysqlEnum("planType", ["starter_saas", "institution_pro", "enterprise_pharma", "featured_sponsor"]).notNull(),
  estimatedTrialsPerYear: int("estimatedTrialsPerYear").default(3).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrganizationInquiry = typeof organizationInquiries.$inferSelect;
export type InsertOrganizationInquiry = typeof organizationInquiries.$inferInsert;
