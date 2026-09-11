import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  UserCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Building2,
  CheckCircle2,
  LockKeyhole
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { StudyLoopLogo } from "@/components/StudyLoopLogo";

export interface PIData {
  id: string;
  username: string;
  name: string;
  title: string;
  institution: string;
  studySlug: string;
  studyTitle: string;
  compensation: string;
  irbNumber: string;
}

export const PI_ACCOUNTS: PIData[] = [
  {
    id: "pi_whitman",
    username: "pi_whitman",
    name: "Dr. H. Whitman, MD",
    title: "Professor of Medicine & Director",
    institution: "Triangle Center for Aging and Brain Sciences",
    studySlug: "healthy-aging-sensory-resilience-study",
    studyTitle: "Healthy Aging & Multi-Sensory Neural Resilience Study",
    compensation: "$650",
    irbNumber: "Pro00109482",
  },
  {
    id: "pi_vance",
    username: "pi_vance",
    name: "Dr. Elena Vance, MD",
    title: "Vice Chair of Clinical Endocrinology",
    institution: "Apex Pharma Therapeutics & Clinical Trials",
    studySlug: "novel-oral-glp1-glycemic-control-trial",
    studyTitle: "Phase II Evaluation of Once-Weekly Oral GLP-1 Receptor Agonist",
    compensation: "$1,850",
    irbNumber: "FDA-IND-189302",
  },
  {
    id: "pi_aris",
    username: "pi_aris",
    name: "Dr. Rachel Aris, MD, PhD",
    title: "Chief of Cellular Immunology",
    institution: "Triangle Thoracic & Surgical Immunology Core",
    studySlug: "healthy-volunteer-immunology-blood-profile",
    studyTitle: "Healthy Volunteer Longitudinal Blood & Immune Profiling",
    compensation: "$250",
    irbNumber: "IRB-2026-00412",
  },
  {
    id: "pi_sterling",
    username: "pi_sterling",
    name: "Dr. Marcus Sterling, PhD",
    title: "Head of Behavioral Sleep Medicine",
    institution: "BioVanguard Digital Health Institute",
    studySlug: "remote-sleep-cardiac-rhythm-digital-study",
    studyTitle: "Remote Sleep & Cardiac Rhythm Monitoring via Wearables",
    compensation: "$320 + ring",
    irbNumber: "WCG-IRB-2025-9981",
  },
  {
    id: "pi_thorne",
    username: "pi_thorne",
    name: "Dr. Julian Thorne, PhD",
    title: "Associate Professor of Neuroeconomics",
    institution: "Carolina Institute for Neuroeconomics (BRIC)",
    studySlug: "fmri-neuroimaging-financial-decision-making",
    studyTitle: "fMRI Neuroimaging of Risk Evaluation in Financial Decisions",
    compensation: "$350",
    irbNumber: "UNC-IRB-25-0814",
  },
  {
    id: "coordinator_sarah",
    username: "coordinator_sarah",
    name: "Sarah Lindquist, CRC",
    title: "Lead Clinical Research Coordinator",
    institution: "Triangle Clinical Trials Operations",
    studySlug: "all",
    studyTitle: "All Active Portfolio Protocols (Lead Coordinator View)",
    compensation: "Multi-site",
    irbNumber: "IRB-PORTFOLIO",
  },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const loginMutation = trpc.auth.loginWithCredentials.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("studyloop_session_user", JSON.stringify(data.user));
      
      if (data.user.username === "marcus_volunteer") {
        localStorage.setItem("studyloop_profile_key", "demo_profile_rural_male");
      } else if (data.user.username === "chloe_student") {
        localStorage.setItem("studyloop_profile_key", "demo_profile_urban_student");
      } else if (data.user.username === "robert_patient") {
        localStorage.setItem("studyloop_profile_key", "demo_profile_chronic_patient");
      }

      toast.success(`Welcome back, ${data.user.name}!`, {
        description: "Accessing your volunteer participant dashboard.",
      });

      setLocation("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Failed to sign in. Please verify your credentials.");
    },
  });

  const registerMutation = trpc.auth.registerWithCredentials.useMutation({
    onSuccess: () => {
      toast.success("Universal volunteer profile created!", {
        description: "You can now log in with your credentials.",
      });
      setMode("login");
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed. Try a different username.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      loginMutation.mutate({ username, password });
    } else {
      registerMutation.mutate({
        username,
        password,
        name,
        email,
        role: "user",
      });
    }
  };

  // Quick Persona Consumer Login
  const handleConsumerPersonaLogin = (persona: "marcus" | "chloe" | "robert") => {
    if (persona === "marcus") {
      localStorage.setItem("studyloop_profile_key", "demo_profile_rural_male");
      const user = { id: 1, name: "Marcus Davis", email: "marcus.davis92@example.com", role: "user" };
      localStorage.setItem("studyloop_session_user", JSON.stringify(user));
      toast.success("Signed in as Marcus Davis (Rural Male Volunteer)");
    } else if (persona === "chloe") {
      localStorage.setItem("studyloop_profile_key", "demo_profile_urban_student");
      const user = { id: 2, name: "Chloe Martinez", email: "chloe.m.student@example.edu", role: "user" };
      localStorage.setItem("studyloop_session_user", JSON.stringify(user));
      toast.success("Signed in as Chloe Martinez (Urban Healthy Student)");
    } else {
      localStorage.setItem("studyloop_profile_key", "demo_profile_chronic_patient");
      const user = { id: 3, name: "Robert Chen", email: "robert.chen.t2d@example.org", role: "user" };
      localStorage.setItem("studyloop_session_user", JSON.stringify(user));
      toast.success("Signed in as Robert Chen (Type 2 Diabetes Patient)");
    }
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-1">
            <StudyLoopLogo size={52} rounded="2xl" />
          </div>
          <div>
            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-semibold py-1 px-3">
              Participant & Volunteer Portal
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Volunteer Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Sign in to access your pre-screened clinical trial matches, track study stipends, and manage scheduled clinic visits.
          </p>
        </div>

        {/* Quick Testing Personas */}
        <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-500" />
              1-Tap Participant Demo Logins:
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Instant dashboard access</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => handleConsumerPersonaLogin("marcus")}
              className="p-3 text-left rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all group cursor-pointer"
            >
              <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs mb-1.5 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                MD
              </div>
              <div className="text-xs font-bold text-slate-900">Marcus Davis</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Rural Male Volunteer</div>
              <Badge variant="outline" className="text-[9px] mt-1.5 bg-emerald-50 text-emerald-700 border-emerald-200">
                Diversity Target
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => handleConsumerPersonaLogin("chloe")}
              className="p-3 text-left rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all group cursor-pointer"
            >
              <div className="h-7 w-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs mb-1.5 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                CM
              </div>
              <div className="text-xs font-bold text-slate-900">Chloe Martinez</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Urban Student Control</div>
              <Badge variant="outline" className="text-[9px] mt-1.5 bg-teal-50 text-teal-700 border-teal-200">
                Healthy Control
              </Badge>
            </button>

            <button
              type="button"
              onClick={() => handleConsumerPersonaLogin("robert")}
              className="p-3 text-left rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 transition-all group cursor-pointer"
            >
              <div className="h-7 w-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-1.5 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                RC
              </div>
              <div className="text-xs font-bold text-slate-900">Robert Chen</div>
              <div className="text-[10px] text-slate-500 mt-0.5">T2D Patient (Metformin)</div>
              <Badge variant="outline" className="text-[9px] mt-1.5 bg-purple-50 text-purple-700 border-purple-200">
                Metabolic Trial
              </Badge>
            </button>
          </div>
        </div>

        {/* Standard Credentials Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {mode === "login" ? "Volunteer Credentials Sign In" : "Register Universal Volunteer Profile"}
              </h2>
              <p className="text-xs text-slate-500">Sign in with your email or username</p>
            </div>
            <Badge variant="secondary" className="text-[10px] bg-slate-100">
              Consumer
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-semibold">Full Legal Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-semibold">Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan@example.com"
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <Label className="text-xs text-slate-700 font-semibold">Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-700 font-semibold">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending || registerMutation.isPending}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold h-10 cursor-pointer"
            >
              {loginMutation.isPending ? "Authenticating..." : mode === "login" ? "Sign In as Volunteer" : "Create Profile Account"}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-xs text-sky-600 hover:text-sky-700 font-medium cursor-pointer"
            >
              {mode === "login" ? "Need an account? Create a free universal profile" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>

        {/* Clear Institutional Boundary Callout */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-slate-700" />
              Principal Investigator or Research Site?
            </div>
            <p className="text-[11px] text-slate-500">
              Access the Institutional Protocol Portal, candidate screening queue, and IRB metrics.
            </p>
          </div>
          <Link href="/institution/login">
            <Button variant="outline" size="sm" className="text-xs font-bold shrink-0 self-start sm:self-center border-slate-300 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer">
              Institutional Sign In
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          <span>Encrypted participant data and HIPAA-compliant screening privacy.</span>
        </div>
      </div>
    </div>
  );
}
