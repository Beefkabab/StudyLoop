import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getAllStudies,
  getStudyById,
  getStudyBySlug,
  getStudyScreenerQuestions,
  createStudyWithScreeners,
  updateStudy,
  upsertParticipantProfile,
  getParticipantProfileByKey,
  toggleSaveStudy,
  getSavedStudiesForProfile,
  getParticipantApplications,
  addStudyReminder,
  getRemindersForProfile,
  calculateMatchScore,
  submitApplicationWithScreener,
  getApplicationsForResearcher,
  updateApplicationStatus,
  createOrganizationInquiry,
  authenticateLocalUser,
  registerLocalUser,
} from "./db";

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
        })
      )
      .mutation(async ({ input, ctx }) => {
        const profileId = await upsertParticipantProfile({
          ...input,
          userId: ctx.user?.id ?? null,
        });
        return { success: true, profileId, profileKey: input.profileKey };
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

  /* ==================== PARTICIPANT APPLICATIONS & REMINDERS ==================== */
  applications: router({
    myApplications: publicProcedure
      .input(z.object({ profileKey: z.string() }))
      .query(async ({ input }) => {
        return await getParticipantApplications(input.profileKey);
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

        // Automatically create a visit checklist reminder if screener passed
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

  /* ==================== RESEARCHER PORTAL ROUTER ==================== */
  researcher: router({
    dashboardOverview: publicProcedure
      .input(
        z
          .object({
            studyId: z.number().optional(),
            studySlug: z.string().optional(),
            status: z.string().optional(),
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
        });

        const totalStudies = studiesToReturn.length;
        const totalApplicants = pipelineApplications.length;
        const qualifiedApplicants = pipelineApplications.filter(
          (a) =>
            a.application.status === "screener_passed" ||
            a.application.status === "scheduled" ||
            a.application.status === "enrolled"
        ).length;
        const screenedOutCount = pipelineApplications.filter(
          (a) => a.application.status === "screened_out"
        ).length;

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
