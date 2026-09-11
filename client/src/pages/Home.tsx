import { Link } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  HeartHandshake,
  Laptop,
  MapPin,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Target,
  UsersRound,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-white">
      {/* Hero */}
      <section className="relative bg-[#f8fcff] border-b border-sky-100 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_88%_18%,rgba(56,189,248,0.22),transparent_21%),radial-gradient(circle_at_15%_82%,rgba(45,212,191,0.14),transparent_24%)]" />
        <div className="container relative pt-12 sm:pt-16 lg:pt-20 pb-14 sm:pb-18 lg:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
            <div className="max-w-2xl">
              <Badge variant="outline" className="bg-white/80 text-sky-700 border-sky-200 text-xs font-semibold py-1 px-2.5 shadow-xs">
                <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                Research opportunities, personalized
              </Badge>
              <h1 className="text-[2.55rem] sm:text-5xl lg:text-[4rem] font-extrabold tracking-[-0.045em] text-slate-950 leading-[0.98] mt-5">
                Finding research that fits your life should feel like finding a job.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed mt-6 max-w-xl">
                StudyLoop matches people to compensated clinical trials, healthy volunteer studies, surveys, and imaging opportunities—with upfront pay, time, and location.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link href="/profile"><Button className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white h-11 px-5 rounded-xl font-bold text-sm shadow-lg shadow-sky-600/20">Create your free profile <ArrowRight className="h-4 w-4" /></Button></Link>
                <Link href="/browse"><Button variant="outline" className="w-full sm:w-auto bg-white border-slate-300 hover:bg-slate-50 h-11 px-5 rounded-xl font-bold text-sm text-slate-800">Explore paid studies</Button></Link>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-7 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-emerald-600" /> Free for participants</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Transparent before applying</span>
                <span className="flex items-center gap-1.5"><CircleDollarSign className="h-4 w-4 text-emerald-600" /> Clear compensation</span>
              </div>
            </div>

            {/* Stylized Participant Opportunity Card (works as a visual without external images) */}
            <div className="relative mx-auto w-full max-w-[480px] lg:max-w-none">
              <div className="absolute -inset-4 rounded-[2rem] bg-sky-300/20 blur-2xl" />
              <div className="relative rounded-[1.5rem] bg-white border border-sky-100 shadow-xl shadow-sky-950/10 p-4 sm:p-5 rotate-0 lg:rotate-2">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5"><div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500 to-teal-500 text-white flex items-center justify-center"><HeartHandshake className="h-4 w-4" /></div><div><p className="text-xs font-extrabold text-slate-900">StudyLoop</p><p className="text-[10px] text-slate-400">Your opportunity feed</p></div></div>
                  <div className="h-8 px-2.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1 text-[10px] font-bold"><Sparkles className="h-3 w-3" /> 4 New Matches</div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs"><div className="h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold">MD</div><div><p className="font-bold text-slate-800">Hi, Marcus</p><p className="text-[10px] text-slate-500">We found a high-priority local match.</p></div></div>
                <div className="mt-4 rounded-xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50/60 p-4">
                  <div className="flex justify-between gap-3"><div><Badge variant="outline" className="text-[9px] h-5 bg-emerald-50 text-emerald-700 border-emerald-200">COGNITIVE ASSESSMENT</Badge><h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-2 leading-tight">Healthy Aging & Sensory Resilience</h3><p className="text-[10px] text-slate-500 mt-1">Triangle Aging & Brain Sciences Center</p></div><div className="h-12 w-12 shrink-0 rounded-full bg-emerald-600 text-white flex flex-col items-center justify-center"><span className="text-sm font-extrabold">95%</span><span className="text-[8px] uppercase">match</span></div></div>
                  <div className="grid grid-cols-3 gap-2 mt-4"><HeroInfo icon={<CircleDollarSign className="h-3.5 w-3.5" />} label="Compensation" value="$650" /><HeroInfo icon={<Clock3 className="h-3.5 w-3.5" />} label="Time" value="3 visits" /><HeroInfo icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value="Durham, NC" /></div>
                  <div className="mt-3 bg-emerald-100/70 border border-emerald-200 text-emerald-900 p-2 rounded-lg text-[10px] leading-relaxed"><CheckCircle2 className="inline h-3 w-3 mr-1 text-emerald-600" /><strong>Why you matched:</strong> Healthy volunteer • Age range • Rural representation priority</div>
                </div>
                <div className="mt-3 rounded-xl bg-slate-50 border border-slate-100 p-3 flex justify-between items-center"><div><p className="text-xs font-bold text-slate-800">Ready to explore?</p><p className="text-[10px] text-slate-500">A 2-minute screener unlocks handoff.</p></div><div className="h-8 px-3 rounded-lg bg-slate-900 text-white flex items-center text-[10px] font-bold">Review & Apply</div></div>
              </div>
              <div className="absolute -bottom-6 -left-6 hidden sm:flex rounded-xl border border-slate-200 bg-white shadow-lg p-3 items-center gap-2.5 rotate-[-4deg]"><div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center"><CircleDollarSign className="h-4 w-4" /></div><div><p className="text-[10px] text-slate-400">Paid research</p><p className="text-xs font-extrabold text-slate-900">$250–$1,850+</p></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & value statement */}
      <section className="container py-14 sm:py-18">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-16 items-start">
          <div>
            <Badge variant="outline" className="text-xs bg-rose-50 text-rose-700 border-rose-200">The recruitment gap</Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-3">Good studies need people. Eligible people need to know the studies exist.</h2>
            <p className="text-sm text-slate-600 leading-relaxed mt-4">Traditional trial sites behave like databases: a person has to search, parse jargon, and hope a generic contact form leads somewhere. StudyLoop flips the model with consumer-grade discovery and transparent requirements.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ValueCard index="01" icon={<UserSearchIcon />} headline="Create once" copy="Build a baseline profile covering location, age, volunteer status, and relevant health context." />
            <ValueCard index="02" icon={<Sparkles className="h-5 w-5" />} headline="Match intelligently" copy="See relevant opportunities ranked by practical fit, with transparent reasons behind each score." />
            <ValueCard index="03" icon={<ClipboardCheck className="h-5 w-5" />} headline="Screen with confidence" copy="Complete tailored study questions before your information reaches a coordinator." />
          </div>
        </div>
      </section>

      {/* Phone and computer modes section */}
      <section className="bg-slate-950 text-white py-14 sm:py-18 overflow-hidden">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto"><Badge className="bg-white/10 text-sky-200 border-white/15 text-xs">Designed for both sides of recruitment</Badge><h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3">A phone-friendly participant journey. A desktop-ready research workspace.</h2><p className="text-sm text-slate-300 leading-relaxed mt-3">Participants can discover and apply on a phone. Research teams get the dense, actionable view they need to manage qualified outreach.</p></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 mt-10 max-w-5xl mx-auto items-end">
            <DevicePanel device="phone" />
            <DevicePanel device="desktop" />
          </div>
        </div>
      </section>

      {/* Participant/sponsor CTA cards */}
      <section className="container py-14 sm:py-18">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-6 sm:p-8"><div className="h-10 w-10 rounded-xl bg-sky-600 text-white flex items-center justify-center"><HeartHandshake className="h-5 w-5" /></div><h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-4">For participants</h2><p className="text-sm text-slate-600 leading-relaxed mt-2 max-w-md">You don’t need to understand medical recruitment to find a research opportunity. Start with your profile and get recommendations with pay and time clearly shown.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/profile"><Button className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-9">Create Universal Profile <ArrowRight className="h-3.5 w-3.5" /></Button></Link><Link href="/browse"><Button variant="outline" className="text-xs h-9 bg-white">Browse opportunities</Button></Link></div></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"><div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center"><Building2 className="h-5 w-5" /></div><h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-4">For research teams</h2><p className="text-sm text-slate-600 leading-relaxed mt-2 max-w-md">Get past generic waitlists. Deploy custom screeners, discover underrepresented candidates, and pass only aligned applicants into your recruitment workflow.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/researchers"><Button className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9">View Researcher Portal <ArrowRight className="h-3.5 w-3.5" /></Button></Link><Link href="/for-institutions"><Button variant="outline" className="text-xs h-9">See SaaS pricing</Button></Link></div></div>
        </div>
      </section>

      {/* Clear Disclosure */}
      <section className="border-t border-slate-100 bg-slate-50 py-8"><div className="container flex flex-col sm:flex-row gap-3 sm:items-center"><ShieldCheck className="h-5 w-5 shrink-0 text-sky-600" /><p className="text-xs text-slate-500 leading-relaxed"><strong className="text-slate-700">MVP demonstration:</strong> Study listings, researcher profiles, and metrics are fictional examples informed by the recruitment challenges described in the provided concept. StudyLoop is not a substitute for clinical advice; research sites determine final eligibility and obtain informed consent.</p></div></section>
    </div>
  );
}

function HeroInfo({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div><div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-400">{icon}{label}</div><p className="text-[11px] sm:text-xs font-bold text-slate-800 mt-1 truncate">{value}</p></div>; }
function ValueCard({ index, icon, headline, copy }: { index: string; icon: React.ReactNode; headline: string; copy: string }) { return <div className="rounded-xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs"><div className="flex items-center justify-between"><div className="h-9 w-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">{icon}</div><span className="text-[10px] font-bold text-slate-300">{index}</span></div><h3 className="font-bold text-sm text-slate-900 mt-4">{headline}</h3><p className="text-xs text-slate-500 leading-relaxed mt-1.5">{copy}</p></div>; }
function UserSearchIcon() { return <UsersRound className="h-5 w-5" />; }
function DevicePanel({ device }: { device: "phone" | "desktop" }) {
  if (device === "phone") return <div className="flex flex-col items-center"><div className="w-[240px] bg-slate-800 border-[6px] border-slate-700 rounded-[2rem] p-2 shadow-2xl"><div className="rounded-[1.5rem] overflow-hidden bg-white text-slate-900"><div className="h-6 bg-slate-950 flex justify-center"><div className="h-3 w-16 bg-slate-950 border-b border-slate-800 rounded-b-xl" /></div><div className="p-3"><div className="flex justify-between items-center"><div><p className="text-[9px] text-slate-400">Good afternoon</p><p className="text-xs font-extrabold">Marcus</p></div><div className="h-6 w-6 rounded-full bg-sky-100 text-sky-700 text-[9px] font-bold flex items-center justify-center">MD</div></div><div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-100 p-2"><p className="text-[8px] font-bold text-emerald-700"><Sparkles className="inline h-2.5 w-2.5" /> 95% MATCH</p><p className="text-[10px] font-extrabold mt-1 leading-tight">Healthy Aging Study</p><p className="text-[8px] text-slate-500 mt-1">$650 • Durham • 3 visits</p></div><div className="mt-2 rounded-lg border border-slate-100 p-2"><p className="text-[10px] font-bold">Blood & Immune Profile</p><p className="text-[8px] text-slate-500 mt-1">$250 • 2 visits</p></div><div className="mt-4 pt-2 border-t border-slate-100 flex justify-around text-[8px] text-sky-600"><span className="font-bold">Explore</span><span>My Matches</span><span>Profile</span></div></div></div></div><div className="mt-5 text-center"><div className="flex gap-1.5 items-center justify-center text-sky-200"><MonitorSmartphone className="h-4 w-4" /><span className="text-xs font-bold">Participant mobile experience</span></div><p className="text-[11px] text-slate-400 mt-1">Discover, pre-screen, and track from anywhere.</p></div></div>;
  return <div className="flex flex-col items-center"><div className="w-full max-w-[470px] bg-slate-800 border border-slate-700 rounded-xl p-2 shadow-2xl"><div className="h-4 flex items-center gap-1.5 px-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-400" /><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /></div><div className="bg-slate-50 rounded-lg overflow-hidden text-slate-900 p-3 grid grid-cols-[60px_1fr] gap-3"><div className="bg-slate-900 rounded-md p-2"><div className="h-4 w-4 bg-sky-500 rounded mb-3" /><div className="space-y-2"><div className="h-1.5 bg-slate-700 rounded" /><div className="h-1.5 bg-slate-700 rounded" /><div className="h-1.5 bg-slate-700 rounded" /></div></div><div><p className="text-[9px] text-sky-700 font-bold">RESEARCH OPERATIONS PORTAL</p><p className="text-xs font-extrabold mt-0.5">Recruitment without blind spots</p><div className="grid grid-cols-4 gap-1.5 mt-3"><MiniScreenCard value="18" label="Applications" color="sky" /><MiniScreenCard value="14" label="Qualified" color="emerald" /><MiniScreenCard value="4" label="Screened out" color="amber" /><MiniScreenCard value="$3.4k" label="Participant pay" color="purple" /></div><div className="grid grid-cols-3 gap-2 mt-2"><div className="col-span-2 bg-white border border-slate-200 rounded p-2"><p className="text-[8px] font-bold">Active study recruitment pulse</p><div className="space-y-1.5 mt-2"><div className="h-1.5 bg-sky-400 rounded-full w-3/4" /><div className="h-1.5 bg-emerald-400 rounded-full w-1/2" /><div className="h-1.5 bg-amber-400 rounded-full w-1/3" /></div></div><div className="bg-white border border-slate-200 rounded p-2"><p className="text-[8px] font-bold">Cohort mix</p><div className="mt-2 h-8 flex items-end gap-1"><div className="w-2 bg-sky-400 h-5" /><div className="w-2 bg-teal-400 h-7" /><div className="w-2 bg-purple-400 h-3" /></div></div></div></div></div></div><div className="mt-5 text-center"><div className="flex gap-1.5 items-center justify-center text-sky-200"><Laptop className="h-4 w-4" /><span className="text-xs font-bold">Research team desktop workspace</span></div><p className="text-[11px] text-slate-400 mt-1">Prioritize qualified outreach and equitable recruitment.</p></div></div>;
}
function MiniScreenCard({ value, label, color }: { value: string; label: string; color: string }) { const colorMap: Record<string,string> = { sky:"text-sky-600", emerald:"text-emerald-600", amber:"text-amber-600", purple:"text-purple-600"}; return <div className="bg-white border border-slate-200 rounded p-1.5"><p className={`text-[9px] font-extrabold ${colorMap[color]}`}>{value}</p><p className="text-[6px] text-slate-400 mt-0.5">{label}</p></div>; }
