import { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  CircleDollarSign,
  LockKeyhole,
  UsersRound,
  Building2,
  Mail,
  ArrowRight,
  Stethoscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface FAQItem {
  id: string;
  category: "general" | "eligibility" | "compensation" | "safety" | "privacy" | "researchers";
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "pay-amount",
    category: "compensation",
    question: "Do I get paid to participate in studies, and how much?",
    answer:
      "Yes! Nearly all studies listed on StudyLoop offer guaranteed financial compensation (stipends) for your time and travel. Amounts range from $50 for quick online surveys to $250–$650 for observational/imaging visits, and up to $1,850+ for multi-visit clinical trials. All compensation amounts, visit requirements, and payout schedules are displayed transparently before you apply.",
  },
  {
    id: "how-paid",
    category: "compensation",
    question: "How and when are participant stipends disbursed?",
    answer:
      "Compensation is typically disbursed immediately following each completed study visit via direct bank deposit, digital gift card, or a reloadable ClinCard prepaid debit card provided by the study coordinator. If a study involves multiple visits, you are compensated incrementally after each visit rather than having to wait until the entire trial concludes.",
  },
  {
    id: "tax-reporting",
    category: "compensation",
    question: "Is clinical trial compensation taxable?",
    answer:
      "Under IRS guidelines, study stipends are considered taxable miscellaneous income. If you earn $600 or more in a single calendar year from an institution, the research institution will issue an IRS Form 1099-MISC. Travel and mileage expense reimbursements are generally non-taxable.",
  },
  {
    id: "no-login-screening",
    category: "eligibility",
    question: "Can I take the pre-screener without creating an account or logging in?",
    answer:
      "Yes! StudyLoop believes in zero friction. You can explore all studies and take the 2-minute pre-screener questions completely anonymously without creating an account or signing in first. If the pre-screener confirms you meet the protocol criteria, you can then enter your name and phone number to send your handoff directly to the study coordinator in 30 seconds.",
  },
  {
    id: "healthy-volunteers",
    category: "eligibility",
    question: "Can healthy people participate, or do I need an illness?",
    answer:
      "Healthy volunteers are essential! Over 40% of all medical research protocols require healthy control participants to establish baseline biological data, benchmark cognitive memory, or test wellness devices. You do not need any diagnosed disease or symptom to participate in compensated research.",
  },
  {
    id: "insurance-needed",
    category: "eligibility",
    question: "Do I need health insurance or a doctor's referral to join?",
    answer:
      "No. You do not need health insurance, nor do you need a referral from your primary care physician. All study-related exams, laboratory blood tests, investigational medications, and doctor visits are 100% covered by the research study sponsor at zero cost to you.",
  },
  {
    id: "withdraw-anytime",
    category: "safety",
    question: "Can I quit or withdraw from a study if I change my mind?",
    answer:
      "Yes, absolutely. Under federal regulations and the Patient Bill of Rights, participation in clinical research is 100% voluntary at all times. You have the legal right to stop participating or withdraw your consent at any point, for any reason, with zero financial penalties, and without affecting your regular medical care.",
  },
  {
    id: "irb-protection",
    category: "safety",
    question: "What is an IRB, and how does it protect participants?",
    answer:
      "An Institutional Review Board (IRB) is an independent committee composed of doctors, ethicists, scientists, and community patient advocates. Federal law requires an IRB to review and approve every clinical trial protocol before any human volunteers can be enrolled. The IRB ensures that participant risks are minimized, informed consent materials are clear, and volunteer rights are strictly safeguarded.",
  },
  {
    id: "safety-risks",
    category: "safety",
    question: "Are clinical trials safe? What risks should I expect?",
    answer:
      "Safety is the primary priority in all clinical research. Observational studies, surveys, and fMRI brain scans carry virtually no physical risk. Clinical trials involving new therapies undergo rigorous laboratory and animal testing before reaching human trials. During your informed consent visit, the study doctor will review every known side effect and potential risk in plain language before you decide whether to join.",
  },
  {
    id: "data-privacy",
    category: "privacy",
    question: "Will my medical information or personal data ever be sold?",
    answer:
      "Never. StudyLoop maintains an ethical zero-data-selling guarantee. We do not sell, rent, or monetize your personal health data to insurance companies, pharmaceutical advertisers, or data brokers. Your profile is encrypted with AES-256 and only shared with the specific research team when you choose to submit a qualified application.",
  },
  {
    id: "employer-insurance",
    category: "privacy",
    question: "Will my employer or health insurance company find out?",
    answer:
      "No. Your participation in research is protected under HIPAA and federal confidentiality laws. StudyLoop and research coordinators never notify your employer or health insurance provider. Participation has zero impact on your insurance premiums, health coverage, or employment status.",
  },
  {
    id: "universal-profile",
    category: "general",
    question: "What is the Universal Health Profile?",
    answer:
      "Instead of filling out repetitive 10-page questionnaires for every hospital or university website, StudyLoop's Universal Profile lets you enter your baseline preferences (location, age, conditions, travel distance) once. Our matching engine automatically scores compatibility across Duke, UNC, Wake Forest, and national studies so you only see opportunities that truly fit you.",
  },
  {
    id: "free-platform",
    category: "general",
    question: "Why is StudyLoop completely free for participants?",
    answer:
      "StudyLoop is funded by research institutions, academic medical centers, and biotechnology sponsors who subscribe to our platform to manage their recruitment pipelines. Participants never pay any fee, subscription, or percentage of their stipend.",
  },
  {
    id: "researcher-post",
    category: "researchers",
    question: "How do university research teams list a study on StudyLoop?",
    answer:
      "Principal investigators and clinical research coordinators (CRCs) can create an institutional account or sign into the Researcher Portal. You can input protocol parameters, set demographic representation quotas, and configure pre-screener questions in under 10 minutes. Qualified candidates appear directly on your dashboard ready for outreach.",
  },
  {
    id: "diversity-mandates",
    category: "researchers",
    question: "How does StudyLoop help sites meet FDA/NIH diversity mandates?",
    answer:
      "Under the FDA 2024 Diversity Action Plan requirements, trials must enroll representative patient cohorts across age, race, gender, and geography. StudyLoop features proactive rural outreach algorithms and localized community discovery to help coordinators hit diversity targets without costly advertising agencies.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "general", label: "Getting Started" },
  { id: "eligibility", label: "Eligibility & Screening" },
  { id: "compensation", label: "Stipends & Pay" },
  { id: "safety", label: "Safety & Patient Rights" },
  { id: "privacy", label: "Privacy & HIPAA" },
  { id: "researchers", label: "For Research Teams" },
];

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    "pay-amount": true,
    "no-login-screening": true,
  });

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
      const query = search.toLowerCase().trim();
      const matchesQuery =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  }, [search, selectedCategory]);

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24">
      {/* Header */}
      <section className="bg-white border-b border-slate-200/80 py-12 md:py-16">
        <div className="container max-w-4xl text-center space-y-4">
          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-semibold py-1 px-3">
            <HelpCircle className="h-3.5 w-3.5 mr-1.5 text-sky-600" />
            Knowledge Base & Answers
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-950 leading-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about participating in medical research, receiving stipends, protecting your privacy, and knowing your legal rights.
          </p>

          {/* Search bar */}
          <div className="pt-4 max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by keyword (e.g. pay, blood draw, withdrawal, taxes)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 bg-slate-50/80 border-slate-300 focus:bg-white text-sm rounded-xl"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-700"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="container max-w-4xl mt-8 space-y-8">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 justify-center pb-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>Showing {filteredFaqs.length} answer{filteredFaqs.length === 1 ? "" : "s"}</span>
          <button
            onClick={() => {
              const allOpen = filteredFaqs.reduce((acc, f) => ({ ...acc, [f.id]: true }), {});
              setOpenItems(allOpen);
            }}
            className="text-sky-600 font-semibold hover:underline"
          >
            Expand all
          </button>
        </div>

        {/* Accordion List */}
        {filteredFaqs.length > 0 ? (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = !!openItems[faq.id];
              return (
                <div
                  key={faq.id}
                  className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full text-left p-5 sm:p-6 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                      {faq.question}
                    </span>
                    <div className="shrink-0 text-slate-400 p-1">
                      {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
            <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">No matching questions found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              We couldn't find any questions matching "{search}". Try searching for another topic or browse all categories.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedCategory("all");
              }}
              className="text-xs mt-2"
            >
              Reset Search
            </Button>
          </div>
        )}

        {/* Contact Liaison Box */}
        <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-teal-50 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2">
            <Badge className="bg-sky-600 text-white text-[10px]">Patient Liaison Support</Badge>
            <h3 className="text-lg font-extrabold text-slate-900">Still have questions about a study?</h3>
            <p className="text-xs text-slate-600 max-w-md leading-relaxed">
              Our participant liaison team is available to explain protocol requirements, assist with pre-screeners, or connect you directly with university study coordinators.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
            <Link href="/browse">
              <Button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-10 px-5 rounded-xl">
                Browse Studies Now <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
