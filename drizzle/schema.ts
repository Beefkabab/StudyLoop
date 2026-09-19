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
  preferredContactMethod: mysqlEnum("preferredContactMethod", ["email", "phone", "sms"]).default("email").notNull(),
  isContactVerified: boolean("isContactVerified").default(false).notNull(),
  preferredLocationType: mysqlEnum("preferredLocationType", ["in_person", "remote", "hybrid", "no_preference"]).default("no_preference").notNull(),
  preferredLanguage: varchar("preferredLanguage", { length: 64 }).default("English").notNull(),
  transportationAccess: mysqlEnum("transportationAccess", ["personal_vehicle", "public_transit", "rideshare", "needs_assistance", "none"]).default("personal_vehicle").notNull(),
  accessibilityNeeds: text("accessibilityNeeds"),
  hasCaregiver: boolean("hasCaregiver").default(false).notNull(),
  hasInternetSmartphone: boolean("hasInternetSmartphone").default(true).notNull(),
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
  organizationId: int("organizationId"),
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
 * Study Applications & Lifecycle Pipeline
 * Supports 11 normalized lifecycle statuses, audit tracking, participant-visible explanations, and internal staff notes
 */
export const studyApplications = mysqlTable("study_applications", {
  id: int("id").autoincrement().primaryKey(),
  studyId: int("studyId").notNull(),
  profileId: int("profileId").notNull(),
  status: mysqlEnum("status", [
    // 11 Normalized Lifecycle Statuses
    "draft",
    "submitted",
    "under_review",
    "action_needed",
    "pre_screening",
    "eligible_next_step",
    "enrolled",
    "completed",
    "not_selected",
    "withdrawn",
    "study_closed",
    // Legacy statuses for backward compatibility
    "screener_passed", 
    "screened_out", 
    "pending_contact", 
    "scheduled"
  ]).default("submitted").notNull(),
  screenerResponses: json("screenerResponses").$type<Record<string, any>>().notNull(),
  qualificationScore: int("qualificationScore").default(100).notNull(),
  disqualificationNotes: text("disqualificationNotes"),
  researcherNotes: text("researcherNotes"),
  // Distinct participant vs staff notes
  participantFacingNote: text("participantFacingNote"),
  internalStaffNote: text("internalStaffNote"),
  // Staff assignment
  assignedCoordinatorId: int("assignedCoordinatorId"),
  assignedCoordinatorName: varchar("assignedCoordinatorName", { length: 255 }),
  // Status history & actor tracking
  statusUpdatedAt: timestamp("statusUpdatedAt").defaultNow().notNull(),
  lastStatusChangedByUserId: int("lastStatusChangedByUserId"),
  lastStatusChangedByName: varchar("lastStatusChangedByName", { length: 255 }),
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

/**
 * Application Status History (Auditable lifecycle transitions)
 */
export const applicationStatusHistory = mysqlTable("application_status_history", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  fromStatus: varchar("fromStatus", { length: 64 }),
  toStatus: varchar("toStatus", { length: 64 }).notNull(),
  changedByUserId: int("changedByUserId"),
  changedByName: varchar("changedByName", { length: 255 }),
  participantFacingNote: text("participantFacingNote"),
  internalNote: text("internalNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ApplicationStatusHistory = typeof applicationStatusHistory.$inferSelect;
export type InsertApplicationStatusHistory = typeof applicationStatusHistory.$inferInsert;

/**
 * Participant Tasks & Next Actions
 */
export const participantTasks = mysqlTable("participant_tasks", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId"), // Nullable if generic profile onboarding task
  profileKey: varchar("profileKey", { length: 64 }).notNull(),
  taskType: mysqlEnum("taskType", [
    "complete_profile",
    "finish_screener",
    "confirm_contact",
    "confirm_availability",
    "review_study_details",
    "contact_support",
    "custom_request"
  ]).default("custom_request").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "expired", "canceled"]).default("pending").notNull(),
  actionUrl: varchar("actionUrl", { length: 255 }),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  createdById: int("createdById"),
  createdByName: varchar("createdByName", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ParticipantTask = typeof participantTasks.$inferSelect;
export type InsertParticipantTask = typeof participantTasks.$inferInsert;

/**
 * Participant Consents & Notification Preferences (Versioned)
 */
export const participantConsents = mysqlTable("participant_consents", {
  id: int("id").autoincrement().primaryKey(),
  profileKey: varchar("profileKey", { length: 64 }).notNull(),
  userId: int("userId"),
  consentType: mysqlEnum("consentType", [
    "terms_of_service",
    "privacy_policy",
    "matching_communications",
    "transactional_email",
    "marketing_email",
    "sms_opt_in"
  ]).notNull(),
  version: varchar("version", { length: 32 }).notNull(), // e.g. "2026.1"
  isGranted: boolean("isGranted").default(true).notNull(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  grantedAt: timestamp("grantedAt").defaultNow().notNull(),
  revokedAt: timestamp("revokedAt"),
});

export type ParticipantConsent = typeof participantConsents.$inferSelect;
export type InsertParticipantConsent = typeof participantConsents.$inferInsert;

/**
 * Notifications (In-App & Email Event Logs)
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  profileKey: varchar("profileKey", { length: 64 }).notNull(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  actionUrl: varchar("actionUrl", { length: 255 }),
  studyId: int("studyId"),
  applicationId: int("applicationId"),
  taskId: int("taskId"),
  isRead: boolean("isRead").default(false).notNull(),
  emailAttempted: boolean("emailAttempted").default(false).notNull(),
  emailDelivered: boolean("emailDelivered").default(false).notNull(),
  emailRecipient: varchar("emailRecipient", { length: 320 }),
  emailDeliveryLog: text("emailDeliveryLog"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Organizations & Research Sites
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["university", "hospital", "biotech", "pharma", "research_center"]).notNull(),
  isVerified: boolean("isVerified").default(true).notNull(),
  irbRegistrationNumber: varchar("irbRegistrationNumber", { length: 64 }),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Organization Members & Role-Based Permissions
 */
export const organizationMembers = mysqlTable("organization_members", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", [
    "organization_owner", 
    "study_manager", 
    "coordinator", 
    "viewer", 
    "studyloop_admin"
  ]).default("coordinator").notNull(),
  assignedStudySlugs: json("assignedStudySlugs").$type<string[]>(), // e.g. ["all"] or ["study-slug-1"]
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type InsertOrganizationMember = typeof organizationMembers.$inferInsert;

/**
 * Product Analytics Event Store (Full Lifecycle Metrics)
 */
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  eventType: varchar("eventType", { length: 64 }).notNull(),
  funnelStage: mysqlEnum("funnelStage", [
    "discovery", 
    "application", 
    "participant_experience", 
    "researcher_ops", 
    "outcomes", 
    "quality"
  ]).notNull(),
  userId: int("userId"),
  profileKey: varchar("profileKey", { length: 64 }),
  studyId: int("studyId"),
  applicationId: int("applicationId"),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

