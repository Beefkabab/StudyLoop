import { getDb } from "./db";
import { studies, screenerQuestions, participantProfiles, studyApplications } from "../drizzle/schema";
import { sql } from "drizzle-orm";

async function seed() {
  const db = await getDb();
  if (!db) throw new Error("DB connection failed");

  console.log("Cleaning old seed data...");
  await db.execute(sql.raw("DELETE FROM study_applications;"));
  await db.execute(sql.raw("DELETE FROM screener_questions;"));
  await db.execute(sql.raw("DELETE FROM studies;"));
  await db.execute(sql.raw("DELETE FROM participant_profiles;"));

  console.log("Seeding illustrative research opportunity examples...");

  // 1. Healthy Aging & Sensory Integration study
  const [study1] = await db.insert(studies).values({
    slug: "healthy-aging-sensory-resilience-study",
    title: "Healthy Aging & Multi-Sensory Neural Resilience Study",
    sponsorName: "Triangle Aging & Brain Sciences Center",
    sponsorType: "university",
    piName: "Dr. H. Whitman, MD",
    piTitle: "Professor of Medicine & Director, Triangle Center for Aging and Human Development",
    studyType: "cognitive_assessment",
    compensationAmount: 650,
    compensationType: "Direct Deposit / Visa Gift Card",
    compensationSchedule: "$150 per visit (3 visits) + $200 completion bonus upon exit interview",
    timeCommitment: "3 visits over 6 weeks (1.5 hrs/visit)",
    durationWeeks: 6,
    locationType: "in_person",
    city: "Durham",
    state: "NC",
    facilityAddress: "Triangle Clinical Research Pavilion, Durham, NC 27710",
    summary: "Investigating how combined visual and hearing sensory cues affect cognitive resilience and daily mobility in older adults. Seeking healthy volunteers, especially men and participants from rural communities.",
    fullDescription: "Our goal is to understand how the brain adapts to subtle sensory variations as we grow older. Participants will undergo safe, non-invasive sensory tests (vision contrast, sound frequency discernment) and brief memory problem-solving activities on a tablet. You will be compensated for each visit attended, plus travel stipend support.",
    irbApprovalNumber: "Pro00109482",
    targetEnrollment: 120,
    currentEnrolled: 54,
    minAge: 50,
    maxAge: 85,
    targetGender: "all",
    healthyVolunteersAccepted: true,
    requiredConditions: [],
    excludedConditions: ["Severe Dementia", "Active Stroke within 6 months"],
    targetDemographicFocus: "Actively seeking rural residents, non-college educated volunteers, and men to achieve representative 40% male enrollment target.",
    isFeatured: true,
    isSponsored: true,
    status: "recruiting",
  });

  const study1Id = study1.insertId;

  // Screeners for Study 1
  await db.insert(screenerQuestions).values([
    {
      studyId: study1Id,
      orderIndex: 1,
      questionText: "Are you between the ages of 50 and 85?",
      explanation: "Protocol is strictly designed for adults aged 50+",
      questionType: "yes_no",
      expectedAnswer: "yes",
      isDisqualifying: true,
      disqualificationReason: "Participants must be at least 50 years of age.",
    },
    {
      studyId: study1Id,
      orderIndex: 2,
      questionText: "Have you had a stroke or traumatic brain injury within the past 6 months?",
      explanation: "Recent acute neurological trauma can skew baseline sensory test data",
      questionType: "yes_no",
      expectedAnswer: "no",
      isDisqualifying: true,
      disqualificationReason: "Recent neurological incidents exclude participation during acute recovery phase.",
    },
    {
      studyId: study1Id,
      orderIndex: 3,
      questionText: "Can you attend 3 scheduled in-person morning visits at the Triangle Clinical Pavilion in Durham, NC?",
      explanation: "Visits include timed reflex assessments in the lab",
      questionType: "yes_no",
      expectedAnswer: "yes",
      isDisqualifying: true,
      disqualificationReason: "Must be able to attend all 3 on-site visits in Durham.",
    },
    {
      studyId: study1Id,
      orderIndex: 4,
      questionText: "Do you have severe uncorrectable vision loss (e.g., total legal blindness)?",
      explanation: "Participants must be able to view basic shapes on a standard computer display",
      questionType: "yes_no",
      expectedAnswer: "no",
      isDisqualifying: true,
      disqualificationReason: "Visual tasks require baseline ability to discern shapes on screen.",
    },
  ]);

  // 2. Healthy Volunteer Blood Biomarker study
  const [study2] = await db.insert(studies).values({
    slug: "healthy-volunteer-immunology-blood-profile",
    title: "Healthy Volunteer Longitudinal Blood & Immune Response Profiling",
    sponsorName: "Triangle Thoracic & Surgical Immunology Lab",
    sponsorType: "hospital",
    piName: "Dr. M. Hartwell, MD, MHS",
    piTitle: "Associate Professor of Surgery, Division of Cardiovascular and Thoracic Surgery",
    studyType: "blood_draw",
    compensationAmount: 250,
    compensationType: "Direct Bank Transfer or Preloaded Card",
    compensationSchedule: "$125 per blood draw visit (2 visits total, 2 weeks apart)",
    timeCommitment: "Two 45-minute visits (morning fasting draw)",
    durationWeeks: 2,
    locationType: "in_person",
    city: "Durham",
    state: "NC",
    facilityAddress: "Triangle Hospital Outpatient Phlebotomy Core, Durham, NC",
    summary: "A 2-visit healthy control study collecting routine peripheral blood samples to establish reference immune biomarkers for transplant and cellular research.",
    fullDescription: "Healthy volunteers are the backbone of diagnostic breakthroughs. In this study, we collect two routine blood samples (approx. 4 tablespoons each) 14 days apart. The visits are quick (under 45 minutes) and scheduled early in the morning so you can get on with your work or study day.",
    irbApprovalNumber: "Pro00084321",
    targetEnrollment: 80,
    currentEnrolled: 32,
    minAge: 18,
    maxAge: 65,
    targetGender: "all",
    healthyVolunteersAccepted: true,
    requiredConditions: [],
    excludedConditions: ["Active Chronic Infection", "Immunosuppressant Medication", "Bleeding Disorder"],
    targetDemographicFocus: "Reliable healthy volunteers who can commit to two punctually scheduled morning appointments.",
    isFeatured: true,
    isSponsored: false,
    status: "recruiting",
  });

  const study2Id = study2.insertId;

  // Screeners for Study 2
  await db.insert(screenerQuestions).values([
    {
      studyId: study2Id,
      orderIndex: 1,
      questionText: "Have you taken systemic oral antibiotics within the last 30 days?",
      explanation: "Recent antibiotic therapy alters circulating lymphocyte profiles",
      questionType: "yes_no",
      expectedAnswer: "no",
      isDisqualifying: true,
      disqualificationReason: "Antibiotic exposure within 30 days alters immune baseline.",
    },
    {
      studyId: study2Id,
      orderIndex: 2,
      questionText: "Do you have any diagnosed blood clotting or bleeding disorders?",
      explanation: "Safety requirement for routine venous phlebotomy",
      questionType: "yes_no",
      expectedAnswer: "no",
      isDisqualifying: true,
      disqualificationReason: "Bleeding disorders present phlebotomy contraindications.",
    },
    {
      studyId: study2Id,
      orderIndex: 3,
      questionText: "Are you comfortable with a certified phlebotomist drawing 4 tablespoons of blood while fasting?",
      explanation: "Routine standard blood draw procedure",
      questionType: "yes_no",
      expectedAnswer: "yes",
      isDisqualifying: true,
      disqualificationReason: "Study requires standard venipuncture sample collection.",
    },
    {
      studyId: study2Id,
      orderIndex: 4,
      questionText: "Are you able to return for visit 2 exactly 14 days after your initial draw?",
      explanation: "Logistical follow-through is critical for paired data analysis",
      questionType: "yes_no",
      expectedAnswer: "yes",
      isDisqualifying: true,
      disqualificationReason: "Protocol requires strict 14-day longitudinal re-test.",
    },
  ]);

  // 3. Remote Observational Sleep & Wearable Study
  const [study3] = await db.insert(studies).values({
    slug: "remote-sleep-cardiac-rhythm-digital-study",
    title: "National Digital Sleep & Circadian Rhythm Observational Study",
    sponsorName: "BioVanguard Digital Health Institute",
    sponsorType: "biotech",
    piName: "Dr. Elena Rostova, PhD",
    piTitle: "Head of Computational Chronobiology",
    studyType: "observational_survey",
    compensationAmount: 320,
    compensationType: "Amazon E-Gift Card or Venmo",
    compensationSchedule: "$80 every 2 weeks + smart ring provided free to keep upon completion",
    timeCommitment: "10 minutes daily app check-in + sleep ring wear for 6 weeks",
    durationWeeks: 6,
    locationType: "remote",
    city: "Nationwide (Remote)",
    state: "US",
    facilityAddress: "Fully remote. Devices mailed directly to your home.",
    summary: "Participate entirely from home! Receive a complimentary medical-grade smart health ring, track your sleep cycles, and log daily energy ratings via our participant mobile app.",
    fullDescription: "Explore how daily screen exposure, ambient light, and stress affect sleep micro-architecture. You will wear an unobtrusive finger sensor while sleeping and fill out a quick 2-minute morning log. No clinic visits or blood draws required. Open to adults across all 50 states.",
    irbApprovalNumber: "WIRB-2026-9921",
    targetEnrollment: 400,
    currentEnrolled: 285,
    minAge: 18,
    maxAge: 75,
    targetGender: "all",
    healthyVolunteersAccepted: true,
    requiredConditions: [],
    excludedConditions: ["Shift Work Sleep Disorder", "Untreated Severe Sleep Apnea"],
    targetDemographicFocus: "Everyday working adults, parents, and students looking for low-friction remote compensation.",
    isFeatured: true,
    isSponsored: true,
    status: "recruiting",
  });

  const study3Id = study3.insertId;

  await db.insert(screenerQuestions).values([
    {
      studyId: study3Id,
      orderIndex: 1,
      questionText: "Do you have an active iPhone (iOS 16+) or Android smartphone capable of syncing Bluetooth data?",
      explanation: "The companion app requires daily sync with the study ring",
      questionType: "yes_no",
      expectedAnswer: "yes",
      isDisqualifying: true,
      disqualificationReason: "Requires compatible modern smartphone for sensor synchronization.",
    },
    {
      studyId: study3Id,
      orderIndex: 2,
      questionText: "Do you work night shifts (between 11 PM and 6 AM) on a rotating schedule?",
      explanation: "Rotating shift work disrupts circadian baselines being benchmarked",
      questionType: "yes_no",
      expectedAnswer: "no",
      isDisqualifying: true,
      disqualificationReason: "Study examines standard diurnal day/night sleep cycles.",
    },
    {
      studyId: study3Id,
      orderIndex: 3,
      questionText: "Are you willing to wear a lightweight silicone/titanium ring to bed each night for 6 weeks?",
      explanation: "Nightly data continuity is the primary objective",
      questionType: "yes_no",
      expectedAnswer: "yes",
      isDisqualifying: true,
      disqualificationReason: "Sensor wear is required nightly.",
    },
  ]);

  // 4. Clinical Trial: Type 2 Diabetes Novel GLP-1 Formulation
  const [study4] = await db.insert(studies).values({
    slug: "novel-oral-glp1-glycemic-control-trial",
    title: "Phase II Evaluation of Once-Weekly Oral GLP-1 Receptor Agonist for Glycemic Control",
    sponsorName: "Apex Pharma Therapeutics & Carolina Metabolic Center",
    sponsorType: "pharma",
    piName: "Dr. Marcus Vance, MD, FACP",
    piTitle: "Director of Clinical Endocrinology Research",
    studyType: "clinical_trial",
    compensationAmount: 1850,
    compensationType: "Direct Deposit (Stipend + Travel Reimbursed)",
    compensationSchedule: "$150 per completed monthly visit (10 visits) + $350 completion bonus",
    timeCommitment: "Monthly 2-hour clinical monitoring visit for 24 weeks",
    durationWeeks: 24,
    locationType: "in_person",
    city: "Raleigh",
    state: "NC",
    facilityAddress: "Carolina Metabolic Research Suite 400, Raleigh, NC 27607",
    summary: "Evaluating a next-generation once-weekly oral tablet designed to improve HbA1c and weight management in adults with Type 2 Diabetes.",
    fullDescription: "Participants with diagnosed Type 2 Diabetes will receive either the study oral medication or standard of care comparator, along with regular lab monitoring, physician health checks, and continuous glucose monitor supplies at no cost.",
    irbApprovalNumber: "FDA-IND-189302",
    targetEnrollment: 60,
    currentEnrolled: 22,
    minAge: 21,
    maxAge: 75,
    targetGender: "all",
    healthyVolunteersAccepted: false,
    requiredConditions: ["Type 2 Diabetes"],
    excludedConditions: ["Type 1 Diabetes", "History of Pancreatitis", "End-Stage Renal Disease"],
    targetDemographicFocus: "Adults currently managing Type 2 Diabetes with metformin or lifestyle alone.",
    isFeatured: false,
    isSponsored: true,
    status: "recruiting",
  });

  const study4Id = study4.insertId;

  await db.insert(screenerQuestions).values([
    {
      studyId: study4Id,
      orderIndex: 1,
      questionText: "Have you been diagnosed by a medical professional with Type 2 Diabetes for at least 6 months?",
      explanation: "Study strictly evaluates Type 2 Diabetes management",
      questionType: "yes_no",
      expectedAnswer: "yes",
      isDisqualifying: true,
      disqualificationReason: "Requires confirmed Type 2 Diabetes diagnosis.",
    },
    {
      studyId: study4Id,
      orderIndex: 2,
      questionText: "Do you have a personal history of chronic pancreatitis or medullary thyroid cancer?",
      explanation: "Known contraindication for GLP-1 class agents",
      questionType: "yes_no",
      expectedAnswer: "no",
      isDisqualifying: true,
      disqualificationReason: "Medical contraindication to GLP-1 class medications.",
    },
    {
      studyId: study4Id,
      orderIndex: 3,
      questionText: "Are you able to visit our Raleigh clinical facility once a month for a 2-hour morning appointment?",
      explanation: "Safety monitoring and blood chemistry checks",
      questionType: "yes_no",
      expectedAnswer: "yes",
      isDisqualifying: true,
      disqualificationReason: "Must be able to attend in-person safety monitoring in Raleigh.",
    },
  ]);

  // 5. Brain Imaging (fMRI) Study: Attention & Decision Making
  const [study5] = await db.insert(studies).values({
    slug: "fmri-neuroimaging-financial-decision-making",
    title: "Neuroimaging of Risk Evaluation and Financial Decision Making",
    sponsorName: "Carolina Neurobiology & Behavioral Economics Lab",
    sponsorType: "university",
    piName: "Dr. Sarah Jenkins, PhD",
    piTitle: "Associate Professor of Cognitive Neurobiology",
    studyType: "imaging_mri",
    compensationAmount: 350,
    compensationType: "Immediate Cash / Visa Debit Card",
    compensationSchedule: "$100 mock scanner session + $250 fMRI scanning run",
    timeCommitment: "Single 3.5-hour afternoon session (includes 60 min MRI)",
    durationWeeks: 1,
    locationType: "in_person",
    city: "Chapel Hill",
    state: "NC",
    facilityAddress: "Biomedical Research Imaging Center (BRIC), Chapel Hill, NC 27599",
    summary: "Earn $350 in an afternoon! Non-invasive functional magnetic resonance imaging (fMRI) while playing interactive decision-making computer games.",
    fullDescription: "We use non-invasive MRI scanning to see which areas of the brain light up during uncertainty and reward evaluation. No injections, no radiation. You play simple games with buttons inside a state-of-the-art MRI scanner and receive cash upon completion.",
    irbApprovalNumber: "IRB-2026-BRIC-04",
    targetEnrollment: 75,
    currentEnrolled: 61,
    minAge: 18,
    maxAge: 45,
    targetGender: "all",
    healthyVolunteersAccepted: true,
    requiredConditions: [],
    excludedConditions: ["Metal Implants/Pacemaker", "Severe Claustrophobia", "Pregnancy"],
    targetDemographicFocus: "Healthy young adults, college students, and working professionals in the Research Triangle.",
    isFeatured: false,
    isSponsored: false,
    status: "recruiting",
  });

  const study5Id = study5.insertId;

  await db.insert(screenerQuestions).values([
    {
      studyId: study5Id,
      orderIndex: 1,
      questionText: "Do you have any metallic implants, pacemakers, surgical clips, or metal fragments in your body?",
      explanation: "MRI uses intense magnetic fields where metal objects are strictly prohibited",
      questionType: "yes_no",
      expectedAnswer: "no",
      isDisqualifying: true,
      disqualificationReason: "High-field MRI scanner safety strictly prohibits metal implants.",
    },
    {
      studyId: study5Id,
      orderIndex: 2,
      questionText: "Do you suffer from severe claustrophobia (fear of confined spaces)?",
      explanation: "MRI scanner bore is enclosed during the 60-minute imaging task",
      questionType: "yes_no",
      expectedAnswer: "no",
      isDisqualifying: true,
      disqualificationReason: "Scanner environment requires staying comfortable in an enclosed space.",
    },
    {
      studyId: study5Id,
      orderIndex: 3,
      questionText: "Are you right-handed?",
      explanation: "Neuroimaging motor tasks require consistent right-hand hemispheric mapping",
      questionType: "yes_no",
      expectedAnswer: "yes",
      isDisqualifying: true,
      disqualificationReason: "This specific protocol requires right-handed motor cortex baseline.",
    },
  ]);

  // Seed sample participant profiles demonstrating diversity and match outcomes
  const [p1] = await db.insert(participantProfiles).values({
    profileKey: "demo_profile_rural_male",
    fullName: "Marcus Davis",
    email: "marcus.davis92@example.com",
    phone: "919-555-0144",
    age: 58,
    gender: "male",
    educationLevel: "high_school_or_less",
    livingEnvironment: "rural",
    city: "Sanford",
    state: "NC",
    zipCode: "27330",
    travelDistanceMiles: 45,
    isHealthyVolunteer: true,
    conditions: [],
    medications: ["Multivitamin"],
    hasRecentAntibiotics: false,
    smokerStatus: "never",
  });

  const [p2] = await db.insert(participantProfiles).values({
    profileKey: "demo_profile_urban_female",
    fullName: "Chloe Martinez",
    email: "chloe.m.student@example.edu",
    phone: "919-555-0189",
    age: 23,
    gender: "female",
    educationLevel: "bachelors",
    livingEnvironment: "urban",
    city: "Durham",
    state: "NC",
    zipCode: "27701",
    travelDistanceMiles: 15,
    isHealthyVolunteer: true,
    conditions: [],
    medications: [],
    hasRecentAntibiotics: false,
    smokerStatus: "never",
  });

  const [p3] = await db.insert(participantProfiles).values({
    profileKey: "demo_profile_diabetic_patient",
    fullName: "Robert Chen",
    email: "robert.chen.t2d@example.org",
    phone: "919-555-0219",
    age: 52,
    gender: "male",
    educationLevel: "graduate_degree",
    livingEnvironment: "suburban",
    city: "Cary",
    state: "NC",
    zipCode: "27513",
    travelDistanceMiles: 20,
    isHealthyVolunteer: false,
    conditions: ["Type 2 Diabetes", "Mild Hypertension"],
    medications: ["Metformin 500mg", "Lisinopril 10mg"],
    hasRecentAntibiotics: false,
    smokerStatus: "former",
  });

  // Seed initial applications showing qualified candidates passing the screener
  await db.insert(studyApplications).values([
    {
      studyId: study1Id,
      profileId: p1.insertId,
      status: "screener_passed",
      screenerResponses: {
        "1": "yes",
        "2": "no",
        "3": "yes",
        "4": "no",
      },
      qualificationScore: 100,
      disqualificationNotes: null,
      researcherNotes: "Prime candidate: 58-year-old male from rural Sanford, NC. Exactly matches the study’s underrepresented demographic target. Contacted for visit scheduling.",
    },
    {
      studyId: study2Id,
      profileId: p2.insertId,
      status: "scheduled",
      screenerResponses: {
        "1": "no",
        "2": "no",
        "3": "yes",
        "4": "yes",
      },
      qualificationScore: 100,
      disqualificationNotes: null,
      researcherNotes: "Passed screener with 100% compliance. First blood draw booked for next Tuesday 8:15 AM at Triangle Hospital.",
    },
    {
      studyId: study4Id,
      profileId: p3.insertId,
      status: "pending_contact",
      screenerResponses: {
        "1": "yes",
        "2": "no",
        "3": "yes",
      },
      qualificationScore: 100,
      disqualificationNotes: null,
      researcherNotes: "Confirmed Type 2 Diabetes on metformin. Perfect candidate for oral GLP-1 Phase II cohort.",
    },
  ]);

  console.log("Seed data successfully injected!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
