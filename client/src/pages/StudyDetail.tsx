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
  LockKeyhole
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  const [result, setResult] = useState<{
    passed: boolean;
    disqualifications: string[];
  } | null>(null);

  useEffect(() => {
    setProfileKey(localStorage.getItem("studyloop_profile_key") || "");
  }, []);

  const { data: study, isLoading } = trpc.studies.getBySlug.useQuery({
    slug,
    profileKey: profileKey || undefined,
  });

  const { data: profile } = trpc.profile.get.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  const submitApplication = trpc.applications.submit.useMutation({
    onSuccess: (data) => {
      setResult({ passed: data.passed, disqualifications: data.disqualifications });
      if (data.passed) {
        toast.success("Pre-screener passed!", {
          description: "Your secure handoff is ready for the study coordinator.",
        });
      } else {
        toast.info("Thanks for your interest", {
          description: "Based on your responses, this particular protocol is not a fit right now.",
        });
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const openScreener = () => {
    if (!profileKey || !profile) {
      toast.info("Create your Universal Profile first", {
        description: "It takes a minute and lets us provide accurate matches to research teams.",
      });
      setLocation("/profile");
      return;
    }
    setAnswers({});
    setResult(null);
    setScreenerOpen(true);
  };

  const handleScreenerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!study) return;
    const unanswered = study.screenerQuestions.some((q) => !answers[q.id.toString()]);
    if (unanswered) {
      toast.error("Please answer each pre-screener question before continuing.");
      return;
    }
    submitApplication.mutate({ studyId: study.id, profileKey, answers });
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
        <div className="container h-13 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/browse" className="hover:text-sky-600 flex items-center gap-1 font-medium">
            <ArrowLeft className="h-3.5 w-3.5" /> All opportunities
          </Link>
          <ChevronRight className="h-3 w-3 text-slate-300" />
          <span className="truncate max-w-[220px] text-slate-700">{study.title}</span>
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
                <span className="flex items-center gap-1"><FileCheck2 className="h-3.5 w-3.5 text-emerald-600" /> {study.irbApprovalNumber}</span>
              </div>

              {/* Match panel */}
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
                      <p className="text-xs text-slate-600 mt-0.5">StudyLoop matched your profile based on protocol requirements—not a medical eligibility determination.</p>
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
                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-amber-900">
                    <strong>Get a personalized match score. </strong> Complete a free Universal Profile and see how well this study fits your location, time availability, and baseline health info.
                  </p>
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
                <InfoTile icon={<DollarSign className="h-5 w-5" />} label="Compensation" value={`$${study.compensationAmount} total`} detail={study.compensationSchedule || study.compensationType} accent="emerald" />
                <InfoTile icon={<Clock3 className="h-5 w-5" />} label="Time needed" value={study.timeCommitment} detail={`${study.durationWeeks} week${study.durationWeeks === 1 ? "" : "s"} total`} accent="sky" />
                <InfoTile icon={study.locationType === "remote" ? <MonitorSmartphone className="h-5 w-5" /> : <MapPin className="h-5 w-5" />} label="Where" value={study.locationType === "remote" ? "From home" : `${study.city}, ${study.state}`} detail={study.locationType === "remote" ? "Devices mailed to you" : study.facilityAddress || "Research site"} accent="purple" />
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
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" /> Age {study.minAge}–{study.maxAge}</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" /> {study.targetGender === "all" ? "All genders welcomed" : `Currently prioritizing ${study.targetGender} participants`}</li>
                    <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" /> {study.healthyVolunteersAccepted ? "Healthy volunteers are eligible" : "Specific condition confirmation required"}</li>
                    {Array.isArray(study.requiredConditions) && study.requiredConditions.length > 0 && (
                      <li className="flex items-start gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" /> Diagnosis: {study.requiredConditions.join(", ")}</li>
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

          {/* Sticky application card - desktop / bottom summary on phone */}
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
                  <p className="font-semibold text-slate-800">How applying works</p>
                  <p className="text-slate-500 leading-relaxed">1. Take 2 minutes to answer study-specific questions.</p>
                  <p className="text-slate-500 leading-relaxed">2. Only qualified profiles reach the secure research team pipeline.</p>
                  <p className="text-slate-500 leading-relaxed">3. The coordinator contacts you to discuss informed consent and scheduling.</p>
                </div>

                <Button onClick={openScreener} className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2">
                  <ClipboardCheck className="h-4 w-4 text-teal-300" />
                  {profile ? "Start 2-Minute Pre-Screener" : "Set Up Profile to Apply"}
                </Button>
                <p className="text-center text-[10px] text-slate-400 leading-relaxed">
                  Applying does not commit you to participate. No medical diagnosis is made on StudyLoop.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Pre-screener dialog */}
      {screenerOpen && (
        <div className="fixed inset-0 z-[80] bg-slate-950/55 backdrop-blur-[2px] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-xl sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 mb-1">
                  <LockKeyhole className="h-3.5 w-3.5" /> Secure Dynamic Pre-Screener
                </div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">Quick questions for {study.sponsorName}</h2>
                <p className="text-xs text-slate-500 mt-1">Your answers are shared only if the protocol criteria are met.</p>
              </div>
              <button onClick={() => setScreenerOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {result ? (
              <div className="p-6 sm:p-8 overflow-y-auto text-center">
                {result.passed ? (
                  <>
                    <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                      <CheckCircle2 className="h-9 w-9" />
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold text-slate-900">You passed the pre-screener</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">Great news, {profile?.fullName?.split(" ")[0] || "there"}. Your profile is now in the study team’s qualified pipeline. A coordinator may contact you to confirm details, review informed consent, and schedule an initial visit.</p>
                    <div className="mt-5 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-left text-xs text-emerald-900 flex gap-2">
                      <CalendarDays className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span><strong>Next step:</strong> Watch your inbox for outreach from the research coordinator. Applying is not enrollment.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-16 w-16 bg-amber-100 text-amber-600 rounded-full mx-auto flex items-center justify-center">
                      <AlertTriangle className="h-9 w-9" />
                    </div>
                    <h3 className="mt-4 text-xl font-extrabold text-slate-900">This protocol isn't the right fit today</h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">Thank you for considering research. These results only reflect this study's early screening rules—not your overall eligibility for other paid opportunities.</p>
                    {result.disqualifications.length > 0 && (
                      <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-left text-xs text-slate-600">
                        <p className="font-semibold text-slate-800 mb-1.5">Study protocol notes</p>
                        <ul className="list-disc list-inside space-y-1">
                          {result.disqualifications.map((note, index) => <li key={index}>{note}</li>)}
                        </ul>
                      </div>
                    )}
                  </>
                )}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={() => setScreenerOpen(false)} className="text-xs">Close</Button>
                  <Link href="/browse"><Button onClick={() => setScreenerOpen(false)} className="w-full text-xs bg-sky-600 hover:bg-sky-700">Browse more matches</Button></Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleScreenerSubmit} className="overflow-y-auto">
                <div className="p-5 sm:p-6 space-y-5">
                  {study.screenerQuestions.map((question, index) => (
                    <div key={question.id} className="space-y-2.5">
                      <label className="text-sm font-semibold text-slate-800 leading-relaxed block">
                        <span className="text-sky-600 mr-1.5">{index + 1}.</span>{question.questionText}
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
                  <span className="text-[10px] text-slate-400 hidden sm:block">This is an initial study-specific screen, not medical advice.</span>
                  <Button disabled={submitApplication.isPending} type="submit" className="ml-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-10 rounded-lg flex items-center gap-1.5">
                    {submitApplication.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-emerald-300" />}
                    Check My Fit & Secure Handoff
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

function InfoTile({ icon, label, value, detail, accent }: { icon: React.ReactNode; label: string; value: string; detail: string; accent: "emerald" | "sky" | "purple" }) {
  const styles = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
    sky: "bg-sky-50 text-sky-700 border-sky-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };
  return (
    <div className={`rounded-xl p-3.5 border ${styles[accent]}`}>
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide font-bold opacity-70">{icon}{label}</div>
      <p className="font-bold text-sm text-slate-900 mt-2 leading-snug">{value}</p>
      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{detail}</p>
    </div>
  );
}
