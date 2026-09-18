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
  X,
  TrendingDown,
  Clock,
  FileText,
  DollarSign,
  Calculator,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export interface PlanDefinition {
  id: "starter_saas" | "institution_pro" | "enterprise_pharma";
  badge: string;
  name: string;
  targetAudience: string;
  price: string;
  cadence: string;
  billingNote: string;
  description: string;
  popular?: boolean;
  accent: "sky" | "slate" | "emerald";
  features: string[];
  ctaText: string;
}

const plans: PlanDefinition[] = [
  {
    id: "starter_saas",
    badge: "ACADEMIC & INVESTIGATOR GRANTS",
    name: "Grant & Academic Protocol",
    targetAudience: "University PIs, NIH R01 / K-Award Grantees, Academic Medical Centers",
    price: "$1,850",
    cadence: "per 6-month protocol",
    billingNote: "Or $290 / month • Invoiced for NIH modular grant line items (PO / Net-30)",
    description: "Tailored for academic investigators who need grant-compatible invoicing without open-ended recurring credit card charges.",
    accent: "slate",
    features: [
      "1 active protocol recruitment listing (6-month cycle)",
      "Custom 5–10 question dynamic pre-screener",
      "De-identified qualified applicant handoff to coordinator",
      "Demographic & rural geographic diversity tracking",
      "NIH-compliant recruitment milestone export",
      "IRB-approved promotional asset pack template",
    ],
    ctaText: "Select Academic Grant Plan",
  },
  {
    id: "institution_pro",
    badge: "SITE OPERATIONS & SMOS",
    name: "Research Site Portfolio",
    targetAudience: "Multi-study clinical research sites, university departments, and SMOs",
    price: "$850",
    cadence: "/ month",
    billingNote: "Billed monthly or $7,900 / year prepaid (Save 22%)",
    description: "Predictable site-wide operations software for independent research clinics and trial centers managing multiple concurrent protocols.",
    accent: "sky",
    popular: true,
    features: [
      "Up to 8 concurrent active protocol listings",
      "Unlimited clinical research coordinator (CRC) seats",
      "Candidate triage pipeline with automated status updates",
      "Automated SMS & email visit / screener reminders",
      "Protocol-specific inclusion/exclusion algorithmic matching",
      "21 CFR Part 11 and HIPAA compliant audit logs",
      "Priority placement in regional volunteer discovery feeds",
    ],
    ctaText: "Start Site Subscription",
  },
  {
    id: "enterprise_pharma",
    badge: "BIOPHARMA & CROS",
    name: "Pharma & CRO Performance",
    targetAudience: "Biopharma sponsors (Phase I–IV), global CROs, and decentralized multi-site trials",
    price: "Performance CPQR",
    cadence: "hybrid milestone model",
    billingNote: "$4,500 base protocol activation + $185–$340 per Qualified Pre-Screened Referral (CPQR)",
    description: "Outcome-aligned recruitment for commercial sponsors who need guaranteed pre-screened pipeline velocity instead of passive listings.",
    accent: "emerald",
    features: [
      "Unlimited multi-site protocol deployment & geographic routing",
      "Dedicated recruitment cohort targeting (FDA Diversity Action Plans)",
      "Success-based pricing: Pay only for verified protocol-screened referrals",
      "Custom CRO / EDC pipeline integrations & direct coordinator handoffs",
      "Dropout-prevention reminders & participant travel stipend workflow",
      "Dedicated Clinical Recruitment Manager & custom BAA / SLA",
    ],
    ctaText: "Request Protocol Proposal",
  },
];

export default function ForInstitutions() {
  const [selectedPlan, setSelectedPlan] = useState<"starter_saas" | "institution_pro" | "enterprise_pharma" | "featured_sponsor" | null>(null);
  const [billingFrequency, setBillingFrequency] = useState<"annual" | "monthly">("annual");
  const [orgName, setOrgName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [trials, setTrials] = useState("3");
  const [notes, setNotes] = useState("");

  const inquiry = trpc.inquiries.submit.useMutation({
    onSuccess: () => {
      toast.success("Institutional inquiry submitted successfully", { 
        description: "Our research partnership team will review your protocol requirements and follow up within 1 business day." 
      });
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.25),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.18),transparent_26%)]" />
        <div className="container relative py-14 sm:py-18 lg:py-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap mb-4">
              <Badge className="bg-sky-500/15 text-sky-200 border border-sky-400/30 text-xs">
                Clinical Research Organizations & Study Sites
              </Badge>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs bg-emerald-950/30">
                Transparent Outcome-Based Models
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] mt-2">
              Accelerate trial enrollment without unpredictable agency markups.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mt-5 max-w-2xl">
              StudyLoop replaces antiquated clinical recruitment with an active consumer marketplace: transparent participant stipends, algorithmic matching, dynamic IRB pre-screeners, and verified qualified referrals directly to your study coordinator.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button onClick={() => setSelectedPlan("institution_pro")} className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-lg shadow-sky-600/25">
                Explore Institutional Plans <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Link href="/researchers">
                <Button variant="outline" className="bg-transparent border-white/20 hover:bg-white/10 hover:text-white text-white text-xs h-11 px-6 rounded-xl">
                  Open Research Portal Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Participant Protection & Ethical Standard Banner */}
      <section className="container -mt-6 relative z-10">
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/80 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <span>Consumer Guarantee: 100% Free for Research Participants</span>
                <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0">FDA & IRB COMPLIANT</Badge>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                Under federal human subjects regulations (21 CFR Parts 50/56), volunteers never pay application or platform fees. StudyLoop takes zero deductions from participant stipends.
              </p>
            </div>
          </div>
          <Link href="/trust">
            <Button variant="outline" size="sm" className="text-xs font-semibold shrink-0 border-emerald-300 text-emerald-800 hover:bg-emerald-100/60 bg-white/80">
              View Ethical Principles
            </Button>
          </Link>
        </div>
      </section>

      {/* Industry Benchmarking Context (Why Legacy Recruitment Fails) */}
      <section className="container py-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700 border-slate-300">
            Market Economics Benchmark
          </Badge>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-950">
            The True Cost of Clinical Recruitment Delays
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Data from the Tufts Center for the Study of Drug Development (Tufts CSDD) underscores why traditional recruitment models are broken for both academic centers and commercial sponsors.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
              <TrendingDown className="h-4 w-4" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">$6,533</div>
            <div className="text-xs font-bold text-slate-700">Average Cost Per Randomized Patient</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tufts CSDD benchmark across therapeutic areas. Replacing a dropped participant often exceeds $19,000 in agency and coordinator hours.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              <Clock className="h-4 w-4" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900">$40k – $56k</div>
            <div className="text-xs font-bold text-slate-700">Daily Trial Burn Rate When Delayed</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Over 80% of clinical protocols fail to meet initial enrollment deadlines, burning operational budgets while research sites sit idle.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-emerald-200 bg-emerald-50/20 shadow-xs space-y-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-800">$185 – $340</div>
            <div className="text-xs font-bold text-emerald-900">StudyLoop Cost Per Qualified Referral (CPQR)</div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Algorithmic pre-screening eliminates unqualified candidate volume so coordinators review only verified, protocol-ready applicants.
            </p>
          </div>
        </div>
      </section>

      {/* Main Pricing Matrix */}
      <section className="container py-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="outline" className="text-xs bg-sky-50 border-sky-200 text-sky-700 font-semibold">
            Institutional Pricing & Licensing Models
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
            Engineered for Academic Grants, Sites, and Biopharma
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Choose the model that fits your institutional procurement workflow: fixed-term grant invoices, site-wide monthly subscriptions, or performance-based CPQR agreements.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-10 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl bg-white border p-6 sm:p-7 flex flex-col justify-between transition-all ${
                plan.popular
                  ? "border-sky-500 shadow-xl shadow-sky-500/10 ring-2 ring-sky-500"
                  : "border-slate-200 shadow-xs hover:border-slate-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-6">
                  <Badge className="bg-sky-600 text-white border-sky-600 text-[10px] font-bold py-0.5 px-2.5 shadow-sm">
                    <Crown className="h-3 w-3 mr-1 text-amber-200" />
                    MOST POPULAR FOR CLINICAL SITES
                  </Badge>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold tracking-wider text-slate-500 uppercase">
                    {plan.badge}
                  </span>
                  <Badge variant="outline" className="text-[9px] border-slate-200 text-slate-600 font-semibold">
                    {plan.id === "starter_saas" ? "Grant Invoicing" : plan.id === "institution_pro" ? "Site SaaS" : "Pay for Performance"}
                  </Badge>
                </div>

                <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                <p className="text-xs text-slate-600 mt-2 min-h-10 leading-relaxed">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-extrabold text-slate-950">{plan.price}</span>
                    <span className="text-xs font-semibold text-slate-500">{plan.cadence}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">
                    {plan.billingNote}
                  </p>
                </div>

                <Button
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`mt-6 w-full text-xs h-10 font-bold cursor-pointer rounded-xl ${
                    plan.popular
                      ? "bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-600/20"
                      : plan.id === "enterprise_pharma"
                      ? "bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {plan.ctaText}
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>

                {/* Feature List */}
                <div className="mt-7 space-y-3">
                  <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                    Plan Specifications:
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Target user:</span>
                <strong className="text-slate-800 text-right truncate max-w-[180px]">{plan.targetAudience}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sponsored Placement Add-On */}
      <section className="container py-8">
        <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-300/80 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6 items-center shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-amber-800">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Targeted Protocol Acceleration Add-On
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-950 mt-2">
              Need rapid enrollment momentum for an urgent recruitment window?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5">
              Available as an add-on to any plan: boost an active IRB-approved trial with top placement in the participant discover marketplace, targeted push alerts to matching patient profiles, and inclusion in verified patient email digests.
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-amber-200 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">30-Day Enrollment Sprint</span>
              <Badge className="bg-amber-100 text-amber-900 border-amber-300 text-xs font-bold">
                $1,200 / sprint
              </Badge>
            </div>
            <div className="space-y-2 text-xs text-slate-600 pt-1">
              <div className="flex items-center gap-2">
                <Crown className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>Pinned "Featured Protocol" marketplace badge</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>Algorithmic priority in eligible candidate feeds</span>
              </div>
              <div className="flex items-center gap-2">
                <Send className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>Dedicated opt-in patient notification dispatch</span>
              </div>
            </div>
            <Button
              onClick={() => setSelectedPlan("featured_sponsor")}
              variant="outline"
              className="mt-2 w-full text-xs h-9 border-amber-300 text-amber-900 hover:bg-amber-50 font-bold cursor-pointer"
            >
              Add 30-Day Sprint to Protocol
            </Button>
          </div>
        </div>
      </section>

      {/* Trust & Governance Proof */}
      <section className="container py-8">
        <div className="border-t border-slate-200 pt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="space-y-1.5">
            <div className="h-9 w-9 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center mx-auto md:mx-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">21 CFR Part 11 & HIPAA Audit Ready</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every candidate screening action, consent timestamp, and coordinator status change is logged with cryptographically verifiable audit trails.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto md:mx-0">
              <BadgeCheck className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">PI & Coordinator Clinical Autonomy</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              StudyLoop performs front-line pre-screening only. Your principal investigator and study team maintain 100% control over final eligibility and informed consent.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center mx-auto md:mx-0">
              <FileText className="h-5 w-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 mt-2">University PO & Modular Invoicing</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Direct institutional procurement support: we provide W-9s, vendor registration, and Net-30 purchase order billing for university accounting systems.
            </p>
          </div>
        </div>
      </section>

      {/* Inquiry Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[80] bg-slate-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="w-full max-w-lg bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-sky-700">
                  StudyLoop Institutional Partnership
                </p>
                <h3 className="font-extrabold text-slate-950 text-base">
                  Design Your Recruitment Architecture
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={submitInquiry} className="p-5 space-y-4">
              <div className="rounded-xl bg-sky-50/70 border border-sky-200/80 p-3 text-xs text-sky-900 flex items-center justify-between">
                <span>
                  Selected Plan:{" "}
                  <strong>
                    {selectedPlan === "starter_saas"
                      ? "Academic & Grant Protocol ($1,850 / 6-mo license)"
                      : selectedPlan === "institution_pro"
                      ? "Research Site Portfolio ($850 / month)"
                      : selectedPlan === "enterprise_pharma"
                      ? "Biopharma & CRO Performance (CPQR Model)"
                      : "Sponsored Protocol Sprint ($1,200 / 30-day)"}
                  </strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Organization Name *</Label>
                  <Input
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="h-9 text-xs"
                    placeholder="e.g. Duke Health / Triangle Research Site"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-slate-700">Lead Contact Name *</Label>
                  <Input
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="h-9 text-xs"
                    placeholder="e.g. Dr. H. Whitman / Sarah Lindquist"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Institutional Work Email *</Label>
                <Input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                  placeholder="contact@university.edu or site@clinicalops.org"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Concurrent Active Protocols</Label>
                <Select value={trials} onValueChange={setTrials}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 active study (Academic PI)</SelectItem>
                    <SelectItem value="3">2–5 studies (Department or Clinical Site)</SelectItem>
                    <SelectItem value="10">6–15 studies (Multi-Specialty Site / SMO)</SelectItem>
                    <SelectItem value="25">15+ studies (Enterprise Pharma / Multi-Site CRO)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">
                  Target Therapeutic Area or Recruitment Challenge (Optional)
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-xs min-h-20"
                  placeholder="e.g. Need rural healthy controls, improve male representation, Phase II GLP-1 candidate screening..."
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1 text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  disabled={inquiry.isPending}
                  type="submit"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                >
                  {inquiry.isPending ? "Submitting Inquiry..." : "Submit Institutional Inquiry"}
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
