import { Link } from "wouter";
import {
  ShieldCheck,
  LockKeyhole,
  FileCheck2,
  HeartHandshake,
  BadgeCheck,
  CheckCircle2,
  UsersRound,
  EyeOff,
  Database,
  Trash2,
  FileText,
  Sparkles,
  ArrowRight,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TrustPrivacy() {
  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200/80 py-12 md:py-16">
        <div className="container max-w-4xl text-center space-y-4">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold py-1 px-3">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
            Security, Ethics & Compliance Center
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Trust & Privacy at StudyLoop
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Medical research relies entirely on the trust of human volunteers. We hold ourselves to the highest ethical and cryptographic standards to ensure your health data remains protected, confidential, and in your control.
          </p>
        </div>
      </section>

      <div className="container max-w-5xl mt-12 space-y-16">
        {/* The 4 Trust Pillars */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs">
              Guiding Principles
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              The 4 Pillars of StudyLoop Security & Ethics
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Every feature of StudyLoop is engineered around patient sovereignty, privacy, and regulatory rigor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PillarCard
              icon={<LockKeyhole className="h-6 w-6 text-sky-600" />}
              title="HIPAA & Cryptographic Safeguards"
              description="Your personal information is protected using end-to-end industry-grade encryption. We strictly partition your contact info from researchers until you choose to submit."
              bullets={[
                "AES-256 encryption at rest and TLS 1.3 in transit",
                "Role-based access control for verified university research staff",
                "Strict zero-monetization policy: We NEVER sell data to insurers or brokers",
                "Periodic third-party security audits and penetration tests"
              ]}
            />

            <PillarCard
              icon={<FileCheck2 className="h-6 w-6 text-emerald-600" />}
              title="IRB Oversight & FDA Compliance"
              description="Every study opportunity listed on StudyLoop is governed by an Institutional Review Board (IRB) following strict federal medical research guidelines."
              bullets={[
                "All listings operate under FDA 21 CFR Part 50 & 56 regulations",
                "Independent ethical review boards evaluate participant safety and consent",
                "Transparent IRB approval numbers published on every study detail page",
                "Mandatory adverse-event reporting protocols"
              ]}
            />

            <PillarCard
              icon={<HeartHandshake className="h-6 w-6 text-amber-600" />}
              title="The Participant Bill of Rights"
              description="Clinical participation is a voluntary public service, never an obligation. You maintain complete control over your involvement from start to finish."
              bullets={[
                "Absolute right to withdraw at any time without explanation or penalty",
                "Informed consent reviewed verbally and in writing before procedures",
                "Clear disclosure of all potential side effects, time commitments, and risks",
                "Guaranteed receipt of earned stipends for all completed milestones"
              ]}
            />

            <PillarCard
              icon={<UsersRound className="h-6 w-6 text-purple-600" />}
              title="Equitable & Diverse Representation"
              description="Historically, clinical research has failed to represent women, older adults, and minority communities. StudyLoop works to democratize access."
              bullets={[
                "Aligned with the FDA 2024 Diversity Action Plan guidance",
                "Proactive rural outreach algorithms connecting non-metro participants",
                "Transparent compensation to remove transportation and childcare barriers",
                "Culturally competent, plain-language protocol explanations"
              ]}
            />
          </div>
        </section>

        {/* Participant Bill of Rights Deep Dive */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <Badge className="bg-emerald-600 text-white text-[10px]">Ethical Standard</Badge>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                The StudyLoop Participant Bill of Rights
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">21 CFR § 50.25</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            As a participant in medical research facilitated through StudyLoop, you are legally and ethically entitled to the following fundamental rights:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <RightItem
              number="1"
              title="Right to Know the Purpose & Procedures"
              text="You must be given a comprehensive explanation of what the study aims to discover, what tests or drugs are involved, and how long each visit will take."
            />
            <RightItem
              number="2"
              title="Right to Know All Potential Risks & Discomforts"
              text="The principal investigator must describe all foreseeable side effects, inconveniences, or discomforts prior to your enrollment."
            />
            <RightItem
              number="3"
              title="Right to Refuse or Stop at Any Time"
              text="You have the unconditional right to leave the study at any point. Your decision will never compromise your regular healthcare or doctor relationships."
            />
            <RightItem
              number="4"
              title="Right to Ask Questions & Receive Answers"
              text="You may ask questions before, during, and after the study. You must be provided with direct contact information for both the study doctor and the independent IRB."
            />
            <RightItem
              number="5"
              title="Right to Confidentiality & Data Protection"
              text="Your medical records and personal identifying info must remain confidential under HIPAA. Published study findings will never identify you by name."
            />
            <RightItem
              number="6"
              title="Right to Fair & Timely Compensation"
              text="You are entitled to the advertised stipend amount for each visit or procedure you complete, paid promptly without unexpected deductions."
            />
          </div>
        </section>

        {/* Data Sovereignty & User Controls */}
        <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/70 to-teal-50/70 p-6 sm:p-10 shadow-xs space-y-6">
          <div>
            <Badge className="bg-sky-600 text-white text-[10px]">Data Sovereignty</Badge>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
              You Own Your Health Data. Period.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Unlike traditional data brokers who harvest patient records, StudyLoop gives you direct control over your digital footprint.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                <Trash2 className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">1-Click Profile Deletion</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Delete your Universal Profile and purge your health context from our active database anytime in profile settings.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Database className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Zero Third-Party Tracking</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                We do not use advertising trackers, Meta Pixel, or data re-targeting cookies that monitor your medical inquiries.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <EyeOff className="h-4 w-4" />
              </div>
              <h4 className="font-bold text-sm text-slate-900">Anonymous Pre-Screening</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Check whether you qualify for studies without creating an account. Your answers are evaluated in-session without saving identifying info.
              </p>
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="rounded-2xl bg-slate-900 text-white p-8 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Research built on trust, transparency, and respect
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Have confidence knowing every opportunity is pre-vetted, IRB-reviewed, and completely under your control.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/browse">
              <Button className="bg-sky-600 hover:bg-sky-700 text-white font-bold h-11 px-6 text-xs rounded-xl shadow-lg shadow-sky-600/20">
                Explore Available Studies <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 h-11 px-6 text-xs rounded-xl">
                See How It Works
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function PillarCard({
  icon,
  title,
  description,
  bullets,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="font-extrabold text-slate-900 text-base leading-tight">{title}</h3>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{description}</p>
      <ul className="space-y-2 text-xs text-slate-600 pt-1">
        {bullets.map((b, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RightItem({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="h-5 w-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
          {number}
        </span>
        <h4 className="font-bold text-xs text-slate-900">{title}</h4>
      </div>
      <p className="text-[11px] text-slate-500 leading-relaxed pl-7">{text}</p>
    </div>
  );
}
