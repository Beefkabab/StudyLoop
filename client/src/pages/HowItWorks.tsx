import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  HeartHandshake,
  HelpCircle,
  Laptop,
  LockKeyhole,
  MapPin,
  MessageSquare,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<"participants" | "researchers">("participants");
  const [demoStep, setDemoStep] = useState(1);
  const [demoAnswer, setDemoAnswer] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200/80 py-12 md:py-16">
        <div className="container max-w-4xl text-center space-y-4">
          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-semibold py-1 px-3">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
            Transparent & Patient-First
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
            How StudyLoop Works
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Clinical research shouldn't be hidden behind dense medical jargon or dead-end contact forms. Here is how StudyLoop creates a transparent, dignified bridge between participants and research teams.
          </p>

          {/* Persona Switcher Tabs */}
          <div className="pt-4 flex justify-center">
            <div className="bg-slate-100 p-1 rounded-xl inline-flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setActiveTab("participants")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "participants"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <HeartHandshake className="h-4 w-4 text-sky-600" />
                For Participants & Volunteers
              </button>
              <button
                onClick={() => setActiveTab("researchers")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === "researchers"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Building2 className="h-4 w-4 text-slate-700" />
                For Research Teams & PIs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container max-w-5xl mt-12 space-y-16">
        {activeTab === "participants" ? (
          /* ==================== PARTICIPANT EXPERIENCE ==================== */
          <>
            {/* 4-Step Chain of Actions */}
            <section className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                  The Zero-Friction Journey
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  From Discovery to Stipend in 4 Clear Steps
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  No sign-in wall. No upfront medical records. Complete transparency before you ever apply.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StepCard
                  step="01"
                  title="Browse & Discover"
                  tag="No Login Required"
                  tagColor="sky"
                  description="Search clinical trials, observational studies, and healthy control cohorts. See upfront stipends ($250–$1,850), visit counts, and clinic locations."
                  icon={<Search className="h-5 w-5 text-sky-600" />}
                />

                <StepCard
                  step="02"
                  title="2-Min Pre-Screen"
                  tag="Instant Match Scoring"
                  tagColor="emerald"
                  description="Answer 3–4 protocol-specific questions directly on the study page. Get real-time eligibility feedback and your compatibility score immediately."
                  icon={<ClipboardCheck className="h-5 w-5 text-emerald-600" />}
                />

                <StepCard
                  step="03"
                  title="Fast Handoff"
                  tag="Direct to Coordinator"
                  tagColor="amber"
                  description="If qualified, submit your contact details in 30 seconds. A research coordinator from the university or clinical site reaches out within 24–48 hours."
                  icon={<MessageSquare className="h-5 w-5 text-amber-600" />}
                />

                <StepCard
                  step="04"
                  title="Visit & Compensation"
                  tag="Guaranteed Stipends"
                  tagColor="purple"
                  description="Attend scheduled clinic visits or complete remote protocols. Receive direct payments via direct deposit or pre-paid debit card."
                  icon={<CircleDollarSign className="h-5 w-5 text-purple-600" />}
                />
              </div>
            </section>

            {/* Interactive Pre-Screener Sandbox Preview */}
            <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-white via-sky-50/40 to-teal-50/40 p-6 sm:p-8 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-5 space-y-3">
                  <Badge className="bg-sky-600 text-white text-[11px]">Interactive Demonstration</Badge>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    Experience the 2-minute pre-screener
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Test how our pre-screener works in real time. We never ask for sensitive Social Security Numbers, insurance records, or lengthy forms before showing you if you qualify.
                  </p>
                  <div className="flex flex-col gap-2 pt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Instant pass/fail criteria matching</span>
                    <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Zero obligation to participate</span>
                    <span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-emerald-600" /> Encrypted HIPAA-safe handoff</span>
                  </div>
                </div>

                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                        1
                      </div>
                      <span className="text-xs font-bold text-slate-800">Healthy Aging & Sensory Resilience ($650)</span>
                    </div>
                    <span className="text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded">Sample Question</span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Are you between the ages of 50 and 80, and able to attend 3 on-site visits in Durham, NC?
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5 text-sky-500" />
                      Protocol requirement: Cognitive sensory scans require on-site calibration.
                    </p>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <button
                        onClick={() => setDemoAnswer("yes")}
                        className={`h-11 rounded-lg border text-xs font-bold transition-all ${
                          demoAnswer === "yes"
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
                        }`}
                      >
                        Yes, I meet this criteria
                      </button>
                      <button
                        onClick={() => setDemoAnswer("no")}
                        className={`h-11 rounded-lg border text-xs font-bold transition-all ${
                          demoAnswer === "no"
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:border-rose-400 hover:bg-rose-50"
                        }`}
                      >
                        No
                      </button>
                    </div>

                    {demoAnswer === "yes" && (
                      <div className="mt-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1 animate-in fade-in">
                        <p className="font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Match confirmed! (100% Fit)
                        </p>
                        <p className="text-emerald-800">
                          On the live study page, you would now enter your name & phone to transmit this handoff to Duke University Medical Center.
                        </p>
                      </div>
                    )}

                    {demoAnswer === "no" && (
                      <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1 animate-in fade-in">
                        <p className="font-bold">Transparent Feedback</p>
                        <p className="text-amber-800">
                          StudyLoop immediately lets you know that this particular study is not a fit, and redirects you to remote and survey studies that have no travel requirements.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* What to Expect at a Study Visit */}
            <section className="space-y-6">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-extrabold text-slate-900">What Actually Happens at a Clinical Visit?</h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Demystifying the clinical experience so you know exactly what to anticipate.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <VisitTypeCard
                  title="Healthy Control / Blood Draws"
                  stipend="$150 – $350"
                  time="30 to 60 minutes"
                  points={[
                    "Quick baseline vitals check (blood pressure, temperature)",
                    "Single standard blood draw or saliva sample",
                    "Immediate payout upon completion",
                    "Supports vaccine & immunology breakthroughs"
                  ]}
                />

                <VisitTypeCard
                  title="fMRI & Cognitive Imaging"
                  stipend="$300 – $750"
                  time="1 to 2 hours"
                  points={[
                    "Non-invasive MRI scan while completing memory puzzles",
                    "Ear protection and music provided",
                    "No needles or pharmaceutical drugs involved",
                    "Helps Alzheimer's & neuroscience researchers"
                  ]}
                />

                <VisitTypeCard
                  title="Clinical Treatment Trials"
                  stipend="$600 – $2,500+"
                  time="Multiple visits across weeks"
                  points={[
                    "In-depth physician consultation and health monitoring",
                    "Access to promising investigational therapies",
                    "All study medications & laboratory tests free of charge",
                    "Travel, parking, and meal stipends covered"
                  ]}
                />
              </div>
            </section>

            {/* Bottom Participant CTA */}
            <section className="rounded-2xl bg-slate-900 text-white p-8 text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Ready to find a study that fits your life?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Explore hundreds of paid research opportunities at top institutions. No account required to search or pre-screen.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link href="/browse">
                  <Button className="bg-sky-600 hover:bg-sky-700 text-white font-bold h-11 px-6 text-xs rounded-xl shadow-lg shadow-sky-600/20">
                    Explore Paid Studies Now <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-11 px-6 text-xs rounded-xl">
                    Create Universal Profile
                  </Button>
                </Link>
              </div>
            </section>
          </>
        ) : (
          /* ==================== RESEARCHER EXPERIENCE ==================== */
          <>
            <section className="space-y-8">
              <div className="text-center max-w-2xl mx-auto">
                <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs">
                  Research Operations & Site Intake
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                  Replace $8M/Day Delays with Pre-Screened Candidate Pipelines
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  Clinical research coordinators spend 40% of their day reviewing disqualified voicemails. StudyLoop automates early screening so sites receive only protocol-ready patients.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                    <Laptop className="h-5 w-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Custom Screener Builder</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Define protocol-specific inclusion and exclusion rules. Add clinical explanations to help patients understand why specific medical criteria are necessary.
                  </p>
                  <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Disqualifying logic evaluation</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> NIH/FDA demographic quota tracking</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <UsersRound className="h-5 w-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">Qualified CRC Pipeline</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    View applicant profiles sorted by qualification score. Contact pre-screened candidates with 1 click, track appointment dates, and record recruitment statuses.
                  </p>
                  <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 1-Click contact actions</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Status funnel (Screened → Consent → Enrolled)</li>
                  </ul>
                </div>

                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">IRB & HIPAA Compliance</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Built to integrate seamlessly with institutional review boards. Audit logging, data encryption at rest (AES-256), and participant consent tracking out of the box.
                  </p>
                  <ul className="text-xs text-slate-500 space-y-1.5 pt-2">
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> FDA 21 CFR Part 50 compliant</li>
                    <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> RedCap & Epic EHR export ready</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Researcher CTA */}
            <section className="rounded-2xl bg-slate-900 text-white p-8 text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Accelerate enrollment for your clinical trial
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Join investigators from Duke, UNC Chapel Hill, and Wake Forest using StudyLoop to hit recruitment milestones on schedule.
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link href="/researchers">
                  <Button className="bg-sky-600 hover:bg-sky-700 text-white font-bold h-11 px-6 text-xs rounded-xl shadow-lg">
                    Launch Researcher Portal <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/for-institutions">
                  <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-11 px-6 text-xs rounded-xl">
                    Institutional Pricing & Models
                  </Button>
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function StepCard({
  step,
  title,
  tag,
  tagColor,
  description,
  icon,
}: {
  step: string;
  title: string;
  tag: string;
  tagColor: "sky" | "emerald" | "amber" | "purple";
  description: string;
  icon: React.ReactNode;
}) {
  const badgeStyles = {
    sky: "bg-sky-50 text-sky-700 border-sky-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
            {icon}
          </div>
          <span className="text-xs font-black text-slate-300 tracking-wider">STEP {step}</span>
        </div>
        <div>
          <Badge variant="outline" className={`text-[9px] font-semibold py-0 px-1.5 h-4 mb-1.5 ${badgeStyles[tagColor]}`}>
            {tag}
          </Badge>
          <h3 className="font-extrabold text-sm text-slate-900 leading-tight">{title}</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function VisitTypeCard({
  title,
  stipend,
  time,
  points,
}: {
  title: string;
  stipend: string;
  time: string;
  points: string[];
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-3">
      <div>
        <h4 className="font-extrabold text-sm text-slate-900">{title}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            {stipend}
          </span>
          <span className="text-xs text-slate-400">• {time}</span>
        </div>
      </div>
      <ul className="space-y-2 text-xs text-slate-600 pt-1">
        {points.map((p, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
