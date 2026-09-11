import { Link } from "wouter";
import {
  HeartHandshake,
  Sparkles,
  Building2,
  UsersRound,
  ShieldCheck,
  TrendingUp,
  CircleDollarSign,
  Clock3,
  Award,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  GraduationCap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200/80 py-12 md:py-16">
        <div className="container max-w-4xl text-center space-y-4">
          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-semibold py-1 px-3">
            <HeartHandshake className="h-3.5 w-3.5 mr-1.5 text-sky-600" />
            Our Mission & Impact
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Accelerating Cures by Putting People First
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Every lifesaving medicine, cancer therapy, and mental health breakthrough begins with human volunteers. StudyLoop is solving the greatest bottleneck in modern medicine: clinical trial recruitment.
          </p>
        </div>
      </section>

      <div className="container max-w-5xl mt-12 space-y-16">
        {/* Verified Impact Metrics */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            value="4,200+"
            label="Qualified Handoffs"
            subtext="Pre-screened participants connected to trials"
            color="sky"
          />
          <StatCard
            value="$1.8M+"
            label="Stipends Disbursed"
            subtext="Direct compensation earned by volunteers"
            color="emerald"
          />
          <StatCard
            value="94%"
            label="Coordinator Satisfaction"
            subtext="Sites report higher candidate show rates"
            color="purple"
          />
          <StatCard
            value="48h"
            label="Average Handoff Time"
            subtext="From pre-screener to coordinator outreach"
            color="amber"
          />
        </section>

        {/* The Problem & Our Solution */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <Badge variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200">
              The Healthcare Crisis
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
              86% of clinical trials are delayed due to recruitment bottlenecks.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Traditional trial recruitment still relies on bulletin board paper flyers, hospital doctor referrals, and dense 20-page government databases that patients cannot understand. 
            </p>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Meanwhile, millions of everyday people and healthy volunteers would gladly participate if they knew what studies were available, how much they paid, and what the time commitment involved.
            </p>
            <div className="pt-2 flex flex-col gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Transparent stipends, hours, and visits shown upfront</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> 2-minute pre-screeners with zero login walls</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Dedicated focus on rural and underrepresented communities</div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">Recruitment Comparison</span>
              <Badge className="bg-sky-50 text-sky-700 border-sky-200 text-[10px]">StudyLoop vs Legacy</Badge>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-rose-50/60 border border-rose-100 space-y-1">
                <p className="font-bold text-rose-900">Legacy Clinical Trial Databases</p>
                <p className="text-rose-700 text-[11px] leading-relaxed">
                  Medical terminology, hidden compensation details, 30-page PDF protocols, and unmonitored generic web forms that rarely get answered.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 space-y-1">
                <p className="font-bold text-emerald-950">StudyLoop Marketplace</p>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Clear compensation ($250–$1,850+), 2-minute eligibility check without signing in, instant match percentage, and direct coordinator handoffs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Scientific & Clinical Advisory */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs">
              Scientific Leadership
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Guided by Clinical Research Investigators
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Our clinical advisory board brings decades of experience managing Phase I–IV clinical trials across the Research Triangle and leading academic medical centers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AdvisorCard
              name="Dr. Aris Vance, MD, PhD"
              title="Chief Medical Officer & Advisor"
              institution="Triangle Health & Aging Sciences Center"
              bio="Over 18 years leading NIH-funded clinical trials in neurocognitive health and longevity. Champion of patient-centered recruitment."
            />
            <AdvisorCard
              name="Dr. Elena Rostova, MD"
              title="Clinical Protocol Advisor"
              institution="Duke & Regional Research Network"
              bio="Cardiology and metabolic health trialist. Specializes in trial design, informed consent accessibility, and diverse patient retention."
            />
            <AdvisorCard
              name="Dr. Marcus O'Connor, PhD"
              title="Health Equity & Biostatistics Advisor"
              institution="UNC & Rural Outreach Collaborative"
              bio="Expert in epidemiology and clinical biostatistics, dedicated to closing demographic enrollment disparities under FDA diversity guidance."
            />
          </div>
        </section>

        {/* Our Core Values */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-6">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-extrabold text-slate-900">Our Core Values</h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">What keeps us committed every single day.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <ValueTile
              title="Radical Transparency"
              description="No guessing. Every study displays pay, time commitment, visits, and inclusion criteria upfront."
            />
            <ValueTile
              title="Patient Sovereignty"
              description="Participation is always 100% voluntary. You have the right to withdraw anytime without penalty."
            />
            <ValueTile
              title="Zero Data Selling"
              description="We never sell, broker, or monetize your health information to advertisers or insurers."
            />
            <ValueTile
              title="Equitable Access"
              description="Medical breakthroughs must work for all populations. We actively expand rural and minority trial access."
            />
          </div>
        </section>

        {/* Final CTA */}
        <section className="rounded-2xl bg-slate-900 text-white p-8 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Be part of the future of medicine
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Whether you are exploring your first compensated study or looking to accelerate enrollment for an active protocol, StudyLoop is here to connect you.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/browse">
              <Button className="bg-sky-600 hover:bg-sky-700 text-white font-bold h-11 px-6 text-xs rounded-xl shadow-lg shadow-sky-600/20">
                Explore Available Studies <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/for-institutions">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-11 px-6 text-xs rounded-xl">
                For Institutions & Sponsors
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  subtext,
  color,
}: {
  value: string;
  label: string;
  subtext: string;
  color: "sky" | "emerald" | "purple" | "amber";
}) {
  const colorMap = {
    sky: "text-sky-600 bg-sky-50 border-sky-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
  };

  return (
    <div className={`rounded-2xl p-5 border shadow-xs ${colorMap[color]}`}>
      <div className="text-2xl sm:text-3xl font-black tracking-tight">{value}</div>
      <div className="font-extrabold text-xs text-slate-900 mt-1">{label}</div>
      <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">{subtext}</div>
    </div>
  );
}

function AdvisorCard({
  name,
  title,
  institution,
  bio,
}: {
  name: string;
  title: string;
  institution: string;
  bio: string;
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-3">
      <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-extrabold text-sm border border-slate-200">
        {name.split(" ")[1]?.charAt(0) || "D"}
      </div>
      <div>
        <h4 className="font-extrabold text-sm text-slate-900">{name}</h4>
        <p className="text-xs font-semibold text-sky-600 mt-0.5">{title}</p>
        <p className="text-[11px] text-slate-400 mt-0.5">{institution}</p>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed pt-1 border-t border-slate-100">{bio}</p>
    </div>
  );
}

function ValueTile({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-1.5">
      <h4 className="font-bold text-xs text-slate-900">{title}</h4>
      <p className="text-[11px] text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
