import { useState, useEffect } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileCheck2,
  HeartHandshake,
  Landmark,
  Loader2,
  MapPin,
  MonitorSmartphone,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
  X,
  AlertTriangle,
  ClipboardCheck,
  Phone,
  ChevronRight,
  LockKeyhole,
  Bookmark,
  Send,
  User,
  Mail,
  Zap,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const typeMap: Record<string, string> = {
  clinical_trial: "Clinical Trial",
  blood_draw: "Blood Biomarker Study",
  observational_survey: "Remote Observational Study",
  imaging_mri: "fMRI Imaging Study",
  cognitive_assessment: "Cognitive Assessment",
};

export default function StudyDetail() {
  const [, params] = useRoute("/study/:slug");
  const [, setLocation] = useLocation();
  const slug = params?.slug || "";
  const [profileKey, setProfileKey] = useState("");
  const [screenerOpen, setScreenerOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaved, setIsSaved] = useState(false);

  // Screener flow state
  const [eligibilityResult, setEligibilityResult] = useState<{
    passed: boolean;
    disqualifications: string[];
    qualificationScore: number;
    isSubmitted?: boolean;
    coordinatorScheduled?: boolean;
  } | null>(null);

  // Fast-track submission for guests
  const [guestForm, setGuestForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: 35,
    city: "Durham",
    state: "NC",
    zipCode: "27701",
  });

  useEffect(() => {
    const key = localStorage.getItem("studyloop_profile_key") || "";
    setProfileKey(key);

    // Check guest saved studies
    try {
      const savedList: number[] = JSON.parse(localStorage.getItem("studyloop_saved_ids") || "[]");
      if (study?.id && savedList.includes(study.id)) {
        setIsSaved(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const { data: study, isLoading } = trpc.studies.getBySlug.useQuery({
    slug,
    profileKey: profileKey || undefined,
  });

  const { data: profile, refetch: refetchProfile } = trpc.profile.get.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  // Authenticated application submission
  const submitApplication = trpc.applications.submit.useMutation({
    onSuccess: (data) => {
      setEligibilityResult({
        passed: data.passed,
        disqualifications: data.disqualifications,
        qualificationScore: data.passed ? 100 : 40,
        isSubmitted: true,
        coordinatorScheduled: true,
      });
      if (data.passed) {
        toast.success("Pre-screener passed & application submitted!", {
          description: "Your handoff was sent directly to the clinical coordinator.",
        });
      } else {
        toast.info("Thanks for your interest", {
          description: "Based on protocol requirements, this study is not a fit right now.",
        });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  // Guest pre-screener check (no login required)
  const checkEligibilityMutation = trpc.applications.checkEligibility.useMutation({
    onSuccess: (data) => {
      setEligibilityResult({
        passed: data.passed,
        disqualifications: data.disqualifications,
        qualificationScore: data.qualificationScore,
        isSubmitted: false,
      });
      if (data.passed) {
        toast.success("Pre-screener passed!", {
          description: "You qualify for this protocol. Complete your handoff below.",
        });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  // Guest quick-apply (creates profile & submits application in 1 step)
  const quickApplyMutation = trpc.applications.quickApply.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("studyloop_profile_key", data.profileKey);
      setProfileKey(data.profileKey);
      setEligibilityResult({
        passed: data.passed,
        disqualifications: data.disqualifications,
        qualificationScore: 100,
        isSubmitted: true,
        coordinatorScheduled: true,
      });
      refetchProfile();
      toast.success("Application successfully submitted!", {
        description: "Your profile has been created and handoff dispatched to the coordinator.",
      });
    },
    onError: (err) => toast.error(err.message),
  });

  // Toggle bookmark / save
  const toggleSaveStudy = () => {
    if (!study) return;
    const newSaved = !isSaved;
    setIsSaved(newSaved);

    try {
      const savedList: number[] = JSON.parse(localStorage.getItem("studyloop_saved_ids") || "[]");
      const updated = newSaved
        ? Array.from(new Set([...savedList, study.id]))
        : savedList.filter((id) => id !== study.id);
      localStorage.setItem("studyloop_saved_ids", JSON.stringify(updated));
    } catch {
      // ignore
    }

    toast.success(newSaved ? "Study bookmarked!" : "Bookmark removed", {
      description: newSaved ? "You can easily review it later anytime." : undefined,
    });
  };

  const openScreener = () => {
    setAnswers({});
    setEligibilityResult(null);
    setScreenerOpen(true);
  };

  const handleScreenerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!study) return;

    const unanswered = study.screenerQuestions.some((q) => !answers[q.id.toString()]);
    if (unanswered) {
      toast.error("Please answer each question before checking eligibility.");
      return;
    }

    if (profileKey && profile) {
      // Logged in with profile: submit directly to coordinator
      submitApplication.mutate({ studyId: study.id, profileKey, answers });
    } else {
      // Unauthenticated visitor: evaluate eligibility first!
      checkEligibilityMutation.mutate({ studyId: study.id, answers });
    }
  };

  const handleQuickApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!study) return;
    if (!guestForm.fullName.trim() || !guestForm.email.trim()) {
      toast.error("Please enter your name and email address to submit.");
      return;
    }

    quickApplyMutation.mutate({
      studyId: study.id,
      answers,
      fullName: guestForm.fullName.trim(),
      email: guestForm.email.trim(),
      phone: guestForm.phone.trim(),
      age: Number(guestForm.age) || 35,
      city: guestForm.city || study.city,
      state: guestForm.state || study.state,
      zipCode: guestForm.zipCode,
    });
  };

  const handleDemoFill = () => {
    setGuestForm({
      fullName: "Marcus Davis",
      email: "marcus.davis@example.com",
      phone: "(919) 555-0194",
      age: 58,
      city: "Durham",
      state: "NC",
      zipCode: "27701",
    });
    toast.info("Prefilled with demo participant details");
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 text-sky-600 animate-spin" />
      </div>
    );
  }

  if (!study) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50 px-4 text-center gap-3">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <h1 className="text-xl font-bold text-slate-900">This study is no longer available</h1>
        <Link href="/browse"><Button>Explore available studies</Button></Link>
      </div>
    );
  }

  const matchScore = study.match?.score;
  const filled = Math.round((study.currentEnrolled / study.targetEnrollment) * 100);

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Breadcrumb + compact desktop navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container h-13 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/browse" className="hover:text-sky-600 flex items-center gap-1 font-medium">
              <ArrowLeft className="h-3.5 w-3.5" /> All opportunities
            </Link>
            <ChevronRight className="h-3 w-3 text-slate-300" />
            <span className="truncate max-w-[220px] text-slate-700">{study.title}</span>
          </div>

          <button
            onClick={toggleSaveStudy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors hover:bg-slate-50"
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-sky-600 text-sky-600" : "text-slate-400"}`} />
            {isSaved ? "Saved" : "Save Study"}
          </button>
        </div>
      </div>

      <main className="container py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Main Body */}
          <article className="lg:col-span-8 space-y-5">
            <section className="rounded-2xl bg-white border border-slate-200 shadow-xs p-5 sm:p-7">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 font-semibold text-xs">
                  {typeMap[study.studyType]}
                </Badge>
                {study.isSponsored && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 font-medium text-xs">
                    Featured Opportunity
                  </Badge>
                )}
                {study.healthyVolunteersAccepted && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium text-xs">
                    Healthy Volunteers Welcome
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 leading-tight">
                {study.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Building2 className="h-3.5 w-3.5 text-sky-600" /> {study.sponsorName}
                </span>
                <span className="text-slate-300">|</span>
                <span>Protocol lead: {study.piName}</span>
                <span className="text-slate-300">|</span>
                <span className="flex items-center gap-1">
                  <FileCheck2 className="h-3.5 w-3.5 text-emerald-600" /> {study.irbApprovalNumber}
                </span>
              </div>

              {/* Match panel or Guest Invitation */}
              {matchScore !== undefined && matchScore !== null ? (
                <div className={`mt-6 rounded-xl border p-4 ${
                  matchScore >= 80 ? "bg-emerald-50 border-emerald-200" : "bg-sky-50 border-sky-200"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`h-11 w-11 shrink-0 rounded-full text-white flex items-center justify-center font-extrabold text-sm ${
                      matchScore >= 80 ? "bg-emerald-600" : "bg-sky-600"
                    }`}>
                      {matchScore}%
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-amber-500" /> Personalized compatibility analysis
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        StudyLoop matched your profile based on protocol requirements—not a medical eligibility determination.
                      </p>
                      {study.match?.matchReasons?.length ? (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {study.match.matchReasons.slice(0, 3).map((reason, index) => (
                            <span key={index} className="text-[11px] bg-white/80 border border-emerald-100 rounded-md px-2 py-1 text-emerald-800">
                              <CheckCircle2 className="inline h-3 w-3 mr-1 text-emerald-600" />{reason}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-sky-200 bg-sky-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        Check your eligibility in 2 minutes without signing in
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Answer 3-4 protocol questions. If qualified, you can submit your application directly to the coordinator.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={openScreener}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shrink-0"
                  >
                    Start Pre-Screener
                  </Button>
                </div>
              )}
            </section>

            {/* What's involved */}
            <section className="rounded-2xl bg-white border border-slate-200 shadow-xs p-5 sm:p-7">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-sky-600" /> What you'll do
              </h2>
              <p className="mt-3 text-sm text-slate-600 leading-7">{study.fullDescription}</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <InfoTile
                  icon={<DollarSign className="h-5 w-5" />}
                  label="Compensation"
                  value={`$${study.compensationAmount} total`}
                  detail={study.compensationSchedule || study.compensationType}
                  accent="emerald"
                />
                <InfoTile
                  icon={<Clock3 className="h-5 w-5" />}
                  label="Time needed"
                  value={study.timeCommitment}
                  detail={`${study.durationWeeks} week${study.durationWeeks === 1 ? "" : "s"} total`}
                  accent="sky"
                />
                <InfoTile
                  icon={study.locationType === "remote" ? <MonitorSmartphone className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                  label="Where"
                  value={study.locationType === "remote" ? "From home" : `${study.city}, ${study.state}`}
                  detail={study.locationType === "remote" ? "Devices mailed to you" : study.facilityAddress || "Research site"}
                  accent="purple"
                />
              </div>
            </section>

            {/* Recruitment focus / transparent eligibility */}
            <section className="rounded-2xl bg-white border border-slate-200 shadow-xs p-5 sm:p-7">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <UsersRound className="h-5 w-5 text-sky-600" /> Who the team is looking for
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Core protocol criteria</p>
                  <ul className="mt-2.5 space-y-2 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" /> Age {study.minAge}–{study.maxAge}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      {study.targetGender === "all" ? "All genders welcomed" : `Currently prioritizing ${study.targetGender} participants`}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      {study.healthyVolunteersAccepted ? "Healthy volunteers are eligible" : "Specific condition confirmation required"}
                    </li>
                    {Array.isArray(study.requiredConditions) && study.requiredConditions.length > 0 && (
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" /> Diagnosis: {study.requiredConditions.join(", ")}
                      </li>
                    )}
                  </ul>
                </div>
                <div className="rounded-xl bg-sky-50/70 p-4 border border-sky-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sky-600">Representation goal</p>
                  <p className="mt-2.5 text-xs text-slate-700 leading-relaxed">
                    {study.targetDemographicFocus || "The team welcomes people from a broad range of backgrounds and communities."}
                  </p>
                  <div className="mt-3 text-[10px] leading-relaxed text-sky-800 flex gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    Profile matching supports outreach; the study site makes the final enrollment decision.
                  </div>
                </div>
              </div>
            </section>

            {/* Important safety note */}
            <section className="rounded-2xl bg-slate-900 p-5 sm:p-6 text-slate-100">
              <div className="flex gap-3">
                <ShieldCheck className="h-5 w-5 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm">Informed consent comes first</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
                    This listing is an opportunity notice, not medical advice. Before enrolling, the investigator will review the consent form, potential risks, study procedures, payment, and your rights to leave at any time.
                  </p>
                </div>
              </div>
            </section>
          </article>

          {/* Sticky application card */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 bg-gradient-to-br from-sky-600 to-cyan-600 text-white">
                <p className="text-xs uppercase tracking-[0.16em] font-semibold text-sky-100">Clear compensation</p>
                <div className="flex items-end gap-1 mt-1">
                  <span className="text-4xl font-extrabold">${study.compensationAmount}</span>
                  <span className="text-sm font-medium text-sky-100 mb-1">total</span>
                </div>
                <p className="mt-1 text-xs text-sky-100 leading-relaxed">{study.compensationSchedule || study.compensationType}</p>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Recruitment progress</span>
                  <span className="font-bold text-slate-800">{study.currentEnrolled} / {study.targetEnrollment} participants</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400" style={{ width: `${Math.min(100, filled)}%` }} />
                </div>

                <div className="rounded-lg bg-slate-50 p-3 border border-slate-100 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-amber-500" /> Frictionless 4-Step Journey
                  </p>
                  <p className="text-slate-500 leading-relaxed"><strong>1. Pre-Screen:</strong> Answer 3 questions in 2 min (no sign-in).</p>
                  <p className="text-slate-500 leading-relaxed"><strong>2. Instant Fit:</strong> See if you qualify immediately.</p>
                  <p className="text-slate-500 leading-relaxed"><strong>3. Handoff:</strong> Send application to research team.</p>
                  <p className="text-slate-500 leading-relaxed"><strong>4. Visit & Pay:</strong> Attend visit & receive ${study.compensationAmount}.</p>
                </div>

                <Button
                  onClick={openScreener}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm"
                >
                  <ClipboardCheck className="h-4 w-4 text-teal-300" />
                  Start 2-Minute Pre-Screener
                </Button>

                <p className="text-center text-[10px] text-slate-400 leading-relaxed">
                  No sign-in required to pre-screen. Applying does not commit you to participate.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Pre-screener dialog */}
      {screenerOpen && (
        <div className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 mb-1">
                  <LockKeyhole className="h-3.5 w-3.5" /> Secure Dynamic Pre-Screener
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">Quick questions for {study.sponsorName}</h2>
                <p className="text-xs text-slate-500 mt-1">Instant eligibility check. Zero medical records required.</p>
              </div>
              <button
                onClick={() => setScreenerOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* SCREENER STATES */}
            {eligibilityResult ? (
              <div className="p-6 sm:p-8 overflow-y-auto">
                {eligibilityResult.isSubmitted ? (
                  /* FINAL SUBMITTED CONFIRMATION */
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                      <CheckCircle2 className="h-9 w-9" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900">Application Transmitted to Coordinator!</h3>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                      Great news! Your pre-screening answers passed the study criteria. Your qualified profile is now queued in {study.sponsorName}'s research coordinator portal.
                    </p>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-left text-xs space-y-2">
                      <p className="font-bold text-slate-800">What to expect next:</p>
                      <div className="flex items-start gap-2 text-slate-600">
                        <CalendarDays className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                        <span><strong>Outreach within 24–48 hours:</strong> A coordinator will reach out to confirm your answers and answer any questions about the protocol.</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <FileCheck2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Informed consent visit:</strong> You'll review full study details, rights to withdraw, and schedule your appointment.</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <DollarSign className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Stipend payout:</strong> ${study.compensationAmount} compensation disbursed according to the study schedule.</span>
                      </div>
                    </div>

                    <div className="pt-2 grid grid-cols-2 gap-3">
                      <Button variant="outline" onClick={() => setScreenerOpen(false)} className="text-xs">
                        Done
                      </Button>
                      <Link href="/dashboard">
                        <Button onClick={() => setScreenerOpen(false)} className="w-full text-xs bg-slate-900 hover:bg-slate-800 text-white">
                          View in Dashboard
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : eligibilityResult.passed ? (
                  /* QUALIFIED: PROMPT QUICK SUBMIT */
                  <div className="space-y-5">
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-extrabold text-sm">
                        100%
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-emerald-950">Pre-Screener Passed! You are an aligned match.</h3>
                        <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
                          Your responses meet the initial protocol requirements for <strong>{study.title}</strong> (${study.compensationAmount} stipend).
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-extrabold text-slate-900">
                          Submit Application to Research Team
                        </h4>
                        <button
                          type="button"
                          onClick={handleDemoFill}
                          className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 bg-sky-50 px-2.5 py-1 rounded-md transition-colors"
                        >
                          ✨ Autofill Demo
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Enter your contact information so the research coordinator can review your pre-screener and reach out to schedule your visit.
                      </p>

                      <form onSubmit={handleQuickApplySubmit} className="space-y-3 pt-1">
                        <div>
                          <label className="text-xs font-semibold text-slate-700 mb-1 block">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                              required
                              placeholder="e.g. Marcus Davis"
                              value={guestForm.fullName}
                              onChange={(e) => setGuestForm({ ...guestForm, fullName: e.target.value })}
                              className="pl-9 h-9 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">Email Address</label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                required
                                type="email"
                                placeholder="name@example.com"
                                value={guestForm.email}
                                onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                                className="pl-9 h-9 text-xs"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-slate-700 mb-1 block">Phone Number</label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                              <Input
                                placeholder="(555) 000-0000"
                                value={guestForm.phone}
                                onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                                className="pl-9 h-9 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[11px] font-semibold text-slate-700 mb-1 block">Age</label>
                            <Input
                              type="number"
                              min={18}
                              max={100}
                              value={guestForm.age}
                              onChange={(e) => setGuestForm({ ...guestForm, age: parseInt(e.target.value) || 30 })}
                              className="h-9 text-xs"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[11px] font-semibold text-slate-700 mb-1 block">City, State</label>
                            <Input
                              value={`${guestForm.city}, ${guestForm.state}`}
                              onChange={(e) => {
                                const parts = e.target.value.split(",");
                                setGuestForm({
                                  ...guestForm,
                                  city: parts[0]?.trim() || "Durham",
                                  state: parts[1]?.trim() || "NC",
                                });
                              }}
                              className="h-9 text-xs"
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex items-center justify-between gap-3">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setEligibilityResult(null)}
                            className="text-xs text-slate-500"
                          >
                            Back to Questions
                          </Button>
                          <Button
                            type="submit"
                            disabled={quickApplyMutation.isPending}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-10 px-5 rounded-lg flex items-center gap-1.5"
                          >
                            {quickApplyMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-3.5 w-3.5 text-teal-300" />
                            )}
                            Submit Application to Coordinator
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : (
                  /* SCREENED OUT STATE */
                  <div className="text-center space-y-4">
                    <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full mx-auto flex items-center justify-center">
                      <AlertTriangle className="h-9 w-9" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900">This protocol isn't the right fit today</h3>
                    <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                      Thank you for taking the time. These results only reflect this particular study's early criteria—not your overall eligibility for other paid opportunities.
                    </p>
                    {eligibilityResult.disqualifications.length > 0 && (
                      <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-left text-xs text-slate-600 max-w-md mx-auto">
                        <p className="font-semibold text-slate-800 mb-1.5">Specific protocol notes:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {eligibilityResult.disqualifications.map((note, index) => (
                            <li key={index}>{note}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="pt-2 grid grid-cols-2 gap-3 max-w-md mx-auto">
                      <Button variant="outline" onClick={() => setScreenerOpen(false)} className="text-xs">
                        Close
                      </Button>
                      <Link href="/browse">
                        <Button onClick={() => setScreenerOpen(false)} className="w-full text-xs bg-sky-600 hover:bg-sky-700">
                          Browse Other Studies
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* QUESTIONNAIRE FORM */
              <form onSubmit={handleScreenerSubmit} className="overflow-y-auto">
                <div className="p-5 sm:p-6 space-y-5">
                  <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-3 text-xs text-sky-800 flex items-center justify-between">
                    <span className="font-medium">Please answer all {study.screenerQuestions.length} questions truthfully:</span>
                    <span className="font-bold text-sky-900">
                      {Object.keys(answers).length} of {study.screenerQuestions.length} answered
                    </span>
                  </div>

                  {study.screenerQuestions.map((question, index) => (
                    <div key={question.id} className="space-y-2.5">
                      <label className="text-sm font-semibold text-slate-800 leading-relaxed block">
                        <span className="text-sky-600 mr-1.5">{index + 1}.</span>
                        {question.questionText}
                      </label>
                      {question.explanation && (
                        <p className="text-[11px] text-slate-400 flex gap-1.5">
                          <Stethoscope className="h-3 w-3 shrink-0 mt-0.5" /> {question.explanation}
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        {["yes", "no"].map((option) => (
                          <button
                            type="button"
                            key={option}
                            onClick={() => setAnswers((prev) => ({ ...prev, [question.id.toString()]: option }))}
                            className={`h-10 rounded-lg border text-xs font-bold capitalize transition-all ${
                              answers[question.id.toString()] === option
                                ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                                : "bg-white text-slate-700 border-slate-200 hover:border-sky-400 hover:bg-sky-50"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
                  <span className="text-[10px] text-slate-400 hidden sm:block">
                    This is an initial study-specific screen, not medical advice.
                  </span>
                  <Button
                    disabled={checkEligibilityMutation.isPending || submitApplication.isPending}
                    type="submit"
                    className="ml-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-10 px-5 rounded-lg flex items-center gap-1.5"
                  >
                    {checkEligibilityMutation.isPending || submitApplication.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-teal-300" />
                    )}
                    Check Fit & See Results
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  accent: "emerald" | "sky" | "purple";
}) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };
  return (
    <div className={`rounded-xl p-3.5 border ${styles[accent]}`}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide font-bold opacity-70">
        {icon}
        {label}
      </div>
      <p className="font-bold text-sm text-slate-900 mt-2 leading-snug">{value}</p>
      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{detail}</p>
    </div>
  );
}
