import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Crown,
  HeartHandshake,
  Layers3,
  MousePointerClick,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const plans = [
  {
    id: "starter_saas" as const,
    name: "Site Starter",
    price: "$349",
    cadence: "/ study / month",
    description: "For one research team recruiting an active IRB-approved protocol.",
    accent: "slate",
    features: ["1 active study listing", "Transparent compensation showcase", "5-question dynamic pre-screener", "Secure qualified candidate handoff", "Standard application insights"],
  },
  {
    id: "institution_pro" as const,
    name: "Institution Pro",
    price: "$1,250",
    cadence: "/ month",
    description: "For university centers and hospitals managing a portfolio of active protocols.",
    accent: "sky",
    popular: true,
    features: ["Up to 10 active study listings", "Custom 5–10 question pre-screeners", "Demographic / geographic diversity insights", "Participant reminder workflow", "Research coordinator seats", "Priority marketplace visibility"],
  },
  {
    id: "enterprise_pharma" as const,
    name: "Enterprise Pharma",
    price: "Talk to us",
    cadence: "annual agreements",
    description: "For sponsors scaling participant acquisition across locations and studies.",
    accent: "slate",
    features: ["Unlimited multi-site protocols", "Custom sponsor + CRO workspace", "Advanced representation targeting", "Site-level conversion analytics", "Integration & launch support", "Priority success management"],
  },
];

export default function ForInstitutions() {
  const [selectedPlan, setSelectedPlan] = useState<"starter_saas" | "institution_pro" | "enterprise_pharma" | "featured_sponsor" | null>(null);
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [trials, setTrials] = useState("3");
  const [notes, setNotes] = useState("");

  const inquiry = trpc.inquiries.submit.useMutation({
    onSuccess: () => {
      toast.success("Your MVP demo inquiry has been recorded", { description: "In a production rollout, a StudyLoop team member would follow up with you." });
      setSelectedPlan(null);
      setOrgName("");
      setContactName("");
      setEmail("");
      setNotes("");
    },
    onError: (err) => toast.error(err.message),
  });

  const submitInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    inquiry.mutate({
      orgName,
      contactName,
      email,
      planType: selectedPlan,
      estimatedTrialsPerYear: Number(trials),
      notes: notes || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* B2B Hero */}
      <section className="bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.28),transparent_24%),radial-gradient(circle_at_20%_80%,rgba(20,184,166,0.18),transparent_26%)]" />
        <div className="container relative py-14 sm:py-18 lg:py-20">
          <div className="max-w-3xl">
            <Badge className="bg-sky-400/15 text-sky-200 border border-sky-300/20 hover:bg-sky-400/15 text-xs">Built for research organizations</Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] mt-4">Turn outreach into an equitable, qualified participant pipeline.</h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mt-5 max-w-2xl">StudyLoop makes research opportunities discoverable like jobs: a transparent marketplace, algorithmic profile matching, tailored pre-screeners, and a qualified handoff to your coordinator.</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-7">
              <Button onClick={() => setSelectedPlan("institution_pro")} className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs h-10 rounded-lg">See institution pricing <ArrowRight className="h-4 w-4" /></Button>
              <Link href="/researchers"><Button variant="outline" className="bg-transparent border-white/25 hover:bg-white/10 hover:text-white text-white text-xs h-10 rounded-lg">Open research operations demo</Button></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Outcomes */}
      <section className="container -mt-4 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-lg shadow-slate-900/5">
          <Outcome icon={<MousePointerClick className="h-5 w-5" />} headline="Discoverability" copy="Bring relevant participant opportunities to people, rather than relying on them to search a database." />
          <Outcome icon={<ClipboardCheck className="h-5 w-5" />} headline="Qualified handoff" copy="Screen logistics and obvious exclusions with study-specific questions before sending the profile to your team." />
          <Outcome icon={<Target className="h-5 w-5" />} headline="Representation" copy="Find harder-to-reach candidates aligned with protocol goals for geography, education, and gender balance." />
        </div>
      </section>

      {/* Pricing */}
      <section className="container py-14">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="outline" className="text-xs bg-sky-50 border-sky-200 text-sky-700">Subscription Marketplace Model</Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-3">Flexible plans for every research program.</h2>
          <p className="text-sm text-slate-600 mt-3 leading-relaxed">SaaS subscriptions build the recruitment foundation. Sponsored studies add distribution at the moment when enrollment needs momentum.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-9 items-stretch">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative rounded-2xl bg-white border p-6 flex flex-col ${plan.popular ? "border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500" : "border-slate-200 shadow-xs"}`}>
              {plan.popular && <div className="absolute -top-3 left-5"><Badge className="bg-sky-600 text-white border-sky-600 text-[10px] font-bold"><Crown className="h-3 w-3 mr-1 text-amber-200" /> MOST POPULAR</Badge></div>}
              <h3 className="text-lg font-extrabold text-slate-900">{plan.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2 min-h-10">{plan.description}</p>
              <div className="mt-5"><span className="text-3xl font-extrabold text-slate-950">{plan.price}</span><span className="ml-1 text-xs text-slate-500">{plan.cadence}</span></div>
              <Button onClick={() => setSelectedPlan(plan.id)} className={`mt-5 w-full text-xs h-9 font-bold ${plan.popular ? "bg-sky-600 hover:bg-sky-700 text-white" : "bg-slate-900 hover:bg-slate-800 text-white"}`}>{plan.id === "enterprise_pharma" ? "Book a Discovery Call" : "Start Marketplace Conversation"}</Button>
              <ul className="mt-6 space-y-3 text-xs text-slate-700">
                {plan.features.map((feature) => <li key={feature} className="flex gap-2"><Check className="h-4 w-4 text-emerald-600 shrink-0" /><span>{feature}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Sponsored study callout */}
      <section className="container pb-14">
        <div className="rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 items-center">
          <div>
            <div className="flex items-center gap-2 text-amber-800"><Sparkles className="h-5 w-5 text-amber-600" /><span className="text-xs font-bold uppercase tracking-wider">Sponsored Study Distribution</span></div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-3">Need visibility for an urgent recruitment window?</h2>
            <p className="text-sm text-slate-600 leading-relaxed mt-2">Promote an IRB-approved study in the participant feed, matching alerts, and targeted email education—with transparent stipend, time commitment, and location presented upfront.</p>
          </div>
          <div className="rounded-xl bg-white border border-amber-200 p-5 shadow-sm"><p className="text-xs font-bold text-slate-900">Sponsored placement includes</p><div className="mt-3 space-y-2 text-xs text-slate-600"><Line icon={<Crown className="h-3.5 w-3.5" />} text="Featured marketplace card" /><Line icon={<Sparkles className="h-3.5 w-3.5" />} text="Priority in eligible participant match feed" /><Line icon={<Send className="h-3.5 w-3.5" />} text="Opt-in notification campaign" /></div><Button onClick={() => setSelectedPlan("featured_sponsor")} variant="outline" className="mt-4 w-full text-xs h-8 border-amber-300 text-amber-800 hover:bg-amber-50">Ask about sponsored visibility</Button></div>
        </div>
      </section>

      {/* Safety/Platform position */}
      <section className="container">
        <div className="border-t border-slate-200 pt-9 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <Trust icon={<ShieldCheck className="h-5 w-5" />} title="Participant-first transparency" copy="Compensation, commitment, location, and study type are visible before a participant starts a screener." />
          <Trust icon={<BadgeCheck className="h-5 w-5" />} title="Researcher-controlled criteria" copy="Study teams design their own recruitment criteria and decide final medical eligibility and enrollment." />
          <Trust icon={<HeartHandshake className="h-5 w-5" />} title="Designed for access" copy="Marketplace-style recommendations reduce awareness barriers for volunteers beyond traditional registries and referrals." />
        </div>
      </section>

      {/* Inquiry Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="w-full max-w-lg bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between"><div><p className="text-[10px] uppercase tracking-wider font-bold text-sky-700">StudyLoop B2B Inquiry</p><h3 className="font-extrabold text-slate-950">Let's design your recruitment workflow</h3></div><button onClick={() => setSelectedPlan(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"><X className="h-5 w-5" /></button></div>
            <form onSubmit={submitInquiry} className="p-5 space-y-4">
              <p className="text-xs text-slate-500">Selected interest: <strong className="text-slate-800">{selectedPlan.replaceAll("_", " ")}</strong>. This is a working MVP form; submitting stores a demo inquiry only.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3"><FormField label="Organization name *"><Input required value={orgName} onChange={e => setOrgName(e.target.value)} className="h-9 text-xs" placeholder="University / Site / Sponsor" /></FormField><FormField label="Your name *"><Input required value={contactName} onChange={e => setContactName(e.target.value)} className="h-9 text-xs" placeholder="Research operations lead" /></FormField></div>
              <FormField label="Work email *"><Input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="h-9 text-xs" placeholder="name@organization.edu" /></FormField>
              <FormField label="Estimated active studies per year"><Select value={trials} onValueChange={setTrials}><SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">1 study</SelectItem><SelectItem value="3">2–5 studies</SelectItem><SelectItem value="10">6–15 studies</SelectItem><SelectItem value="25">15+ studies</SelectItem></SelectContent></Select></FormField>
              <FormField label="What recruitment challenge are you solving? (optional)"><Textarea value={notes} onChange={e => setNotes(e.target.value)} className="text-xs min-h-20" placeholder="e.g. Need rural healthy controls, improve male enrollment, reduce coordinator screen-outs..." /></FormField>
              <div className="pt-2 flex gap-3"><Button type="button" variant="outline" onClick={() => setSelectedPlan(null)} className="flex-1 text-xs">Cancel</Button><Button disabled={inquiry.isPending} type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs">{inquiry.isPending ? "Saving..." : "Submit Demo Inquiry"} <ArrowRight className="h-3.5 w-3.5" /></Button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Outcome({ icon, headline, copy }: { icon: React.ReactNode; headline: string; copy: string }) { return <div className="p-5 sm:p-6 border-b sm:border-b-0 sm:border-r last:border-0 border-slate-200"><div className="h-9 w-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">{icon}</div><h3 className="font-bold text-sm text-slate-900 mt-3">{headline}</h3><p className="text-xs leading-relaxed text-slate-500 mt-1.5">{copy}</p></div>; }
function Line({ icon, text }: { icon: React.ReactNode; text: string }) { return <div className="flex gap-2 items-center"><span className="text-amber-600">{icon}</span><span>{text}</span></div>; }
function Trust({ icon, title, copy }: { icon: React.ReactNode; title: string; copy: string }) { return <div><div className="h-9 w-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center mx-auto md:mx-0">{icon}</div><h3 className="font-bold text-sm text-slate-900 mt-3">{title}</h3><p className="text-xs text-slate-500 leading-relaxed mt-1.5">{copy}</p></div>; }
function FormField({ label, children }: { label: string; children: React.ReactNode }) { return <div className="space-y-1.5"><Label className="text-xs font-semibold text-slate-700">{label}</Label>{children}</div>; }
