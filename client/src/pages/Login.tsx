import { useState, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  UserCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Building2,
  CheckCircle2,
  LockKeyhole,
  Stethoscope,
  Microscope,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  Check,
  ChevronDown,
  ChevronUp
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
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showMoreProfiles, setShowMoreProfiles] = useState(false);

  // Identify active pre-created state based on current input
  const activeDetectedState = useMemo(() => {
    const cleanUser = username.trim().toLowerCase();
    if (cleanUser === "marcus_volunteer" || cleanUser === "marcus" || cleanUser === "user_profile") {
      return "user_profile";
    }
    if (cleanUser === "pi_whitman" || cleanUser === "whitman" || cleanUser === "sso_pi_profile") {
      return "sso_pi_profile";
    }
    if (cleanUser === "chloe_student" || cleanUser === "chloe") {
      return "chloe";
    }
    if (cleanUser === "robert_patient" || cleanUser === "robert") {
      return "robert";
    }
    if (cleanUser === "pi_vance" || cleanUser === "vance") {
      return "pi_vance";
    }
    if (cleanUser === "coordinator_sarah" || cleanUser === "sarah") {
      return "coordinator_sarah";
    }
    return null;
  }, [username]);

  const loginMutation = trpc.auth.loginWithCredentials.useMutation({
    onSuccess: (data) => {
      const uname = (data.user.username || "").toLowerCase();
      const isPI =
        data.user.role === "researcher" ||
        uname.startsWith("pi_") ||
        uname === "coordinator_sarah" ||
        uname === "sso_pi_profile";

      if (isPI) {
        // Find matching PI account
        const matchedPI =
          PI_ACCOUNTS.find(
            (p) =>
              p.username.toLowerCase() === uname ||
              p.id.toLowerCase() === uname
          ) || PI_ACCOUNTS[0];

        const piUser = {
          id: matchedPI.id,
          name: matchedPI.name,
          title: matchedPI.title,
          email: data.user.email || `${matchedPI.id}@studyloop.org`,
          role: "researcher",
          institution: matchedPI.institution,
          assignedStudySlug: matchedPI.studySlug,
          assignedStudyTitle: matchedPI.studyTitle,
        };

        localStorage.setItem("studyloop_session_user", JSON.stringify(piUser));
        localStorage.setItem("studyloop_active_pi", JSON.stringify(matchedPI));
        localStorage.setItem("studyloop_active_study_slug", matchedPI.studySlug);

        toast.success(`Authenticated via Institutional SSO`, {
          description: `Welcome, ${matchedPI.name}! Loading ${matchedPI.studyTitle}.`,
        });

        setLocation(`/researchers?studySlug=${encodeURIComponent(matchedPI.studySlug)}`);
        return;
      }

      // Volunteer / Participant user
      localStorage.removeItem("studyloop_active_pi");
      localStorage.setItem("studyloop_session_user", JSON.stringify(data.user));

      let profileKey = "demo_profile_rural_male";
      if (uname.includes("chloe")) {
        profileKey = "demo_profile_urban_student";
      } else if (uname.includes("robert")) {
        profileKey = "demo_profile_chronic_patient";
      }
      localStorage.setItem("studyloop_profile_key", profileKey);

      toast.success(`Signed in as ${data.user.name}`, {
        description: "Accessing your participant profile and matched clinical trials.",
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

  // Precreated Login State Selectors (Sets form state so user can login themselves)
  const applyPrecreatedState = (type: "user_profile" | "sso_pi_profile" | "chloe" | "robert" | "pi_vance" | "coordinator_sarah") => {
    setMode("login");
    if (type === "user_profile") {
      setUsername("marcus_volunteer");
      setPassword("volunteer123");
      toast.info("Loaded State: Precreated User Profile", {
        description: "Credentials filled for Marcus Davis (Rural Male Volunteer). Click Sign In below.",
      });
    } else if (type === "sso_pi_profile") {
      setUsername("pi_whitman");
      setPassword("whitman123");
      toast.info("Loaded State: Precreated SSO PI Profile", {
        description: "Credentials filled for Dr. H. Whitman, MD (Institutional SSO). Click Sign In below.",
      });
    } else if (type === "chloe") {
      setUsername("chloe_student");
      setPassword("student123");
      toast.info("Loaded State: Chloe Martinez (Healthy Control)", {
        description: "Click Sign In below.",
      });
    } else if (type === "robert") {
      setUsername("robert_patient");
      setPassword("patient123");
      toast.info("Loaded State: Robert Chen (Type 2 Diabetes Patient)", {
        description: "Click Sign In below.",
      });
    } else if (type === "pi_vance") {
      setUsername("pi_vance");
      setPassword("vance123");
      toast.info("Loaded State: Dr. Elena Vance (Endocrinology PI)", {
        description: "Click Sign In below.",
      });
    } else if (type === "coordinator_sarah") {
      setUsername("coordinator_sarah");
      setPassword("researcher123");
      toast.info("Loaded State: Sarah Lindquist (Lead Coordinator)", {
        description: "Click Sign In below.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6">
      <div className="max-w-2xl w-full mx-auto space-y-6">
        {/* Top Header */}
        <div className="text-center space-y-2.5">
          <div className="flex justify-center mb-1">
            <StudyLoopLogo size={52} rounded="2xl" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-semibold py-0.5 px-2.5">
              StudyLoop Sign In
            </Badge>
            <Badge className="bg-slate-900 text-white text-xs font-semibold py-0.5 px-2.5">
              Precreated Profiles Ready
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sign In to StudyLoop
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Log in yourself using either the precreated <strong>User Profile</strong> (Participant) or the precreated <strong>Institutional SSO PI Profile</strong> (Principal Investigator).
          </p>
        </div>

        {/* The Two Primary Pre-created Login States */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* State Card 1: Precreated User Profile */}
          <div 
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
              activeDetectedState === "user_profile"
                ? "bg-sky-50/80 border-sky-500 shadow-md ring-2 ring-sky-400/20"
                : "bg-white border-slate-200 hover:border-sky-300 hover:bg-sky-50/20 shadow-xs"
            }`}
            onClick={() => applyPrecreatedState("user_profile")}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-sky-100/70 text-sky-700 border-sky-300 text-[10px] font-bold py-0.5 px-2 flex items-center gap-1">
                  <UserCircle2 className="h-3 w-3" />
                  PRECREATED USER PROFILE
                </Badge>
                {activeDetectedState === "user_profile" && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-sky-600">
                    <Check className="h-3.5 w-3.5" /> State Loaded
                  </span>
                )}
              </div>

              <div>
                <div className="text-sm font-bold text-slate-900">Marcus Davis</div>
                <div className="text-xs text-slate-500">Rural Male Volunteer (Age 34)</div>
                <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  Matched: Neural Resilience Study ($650)
                </div>
              </div>

              {/* Exact Credentials Box */}
              <div className="bg-slate-100/90 rounded-lg p-2 font-mono text-[11px] text-slate-700 space-y-0.5 border border-slate-200/80">
                <div><span className="text-slate-400">Username:</span> <strong>marcus_volunteer</strong></div>
                <div><span className="text-slate-400">Password:</span> <strong>volunteer123</strong></div>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                applyPrecreatedState("user_profile");
              }}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold h-8 cursor-pointer shadow-xs"
            >
              {activeDetectedState === "user_profile" ? "✓ Credentials Loaded in Form" : "Load User Profile State"}
            </Button>
          </div>

          {/* State Card 2: Precreated Institutional SSO PI Profile */}
          <div 
            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
              activeDetectedState === "sso_pi_profile"
                ? "bg-slate-900 text-white border-slate-700 shadow-md ring-2 ring-slate-700/30"
                : "bg-slate-950 text-white border-slate-800 hover:border-slate-700 shadow-xs"
            }`}
            onClick={() => applyPrecreatedState("sso_pi_profile")}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-bold py-0.5 px-2 flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  PRECREATED SSO PI PROFILE
                </Badge>
                {activeDetectedState === "sso_pi_profile" && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <Check className="h-3.5 w-3.5" /> State Loaded
                  </span>
                )}
              </div>

              <div>
                <div className="text-sm font-bold text-white">Dr. H. Whitman, MD</div>
                <div className="text-xs text-slate-400">Director, Triangle Center for Aging & Brain Sciences</div>
                <div className="text-[11px] text-sky-400 font-medium mt-0.5">
                  Protocol IRB: Pro00109482 (12 Applicants)
                </div>
              </div>

              {/* Exact Credentials Box */}
              <div className="bg-slate-900 rounded-lg p-2 font-mono text-[11px] text-slate-300 space-y-0.5 border border-slate-800">
                <div><span className="text-slate-500">Staff ID / SSO:</span> <strong>pi_whitman</strong></div>
                <div><span className="text-slate-500">SSO Password:</span> <strong>whitman123</strong></div>
              </div>
            </div>

            <Button
              type="button"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                applyPrecreatedState("sso_pi_profile");
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold h-8 cursor-pointer shadow-xs"
            >
              {activeDetectedState === "sso_pi_profile" ? "✓ Credentials Loaded in Form" : "Load SSO PI Profile State"}
            </Button>
          </div>
        </div>

        {/* Expandable: More Precreated Profiles */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowMoreProfiles(!showMoreProfiles)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            {showMoreProfiles ? "Hide additional precreated profiles" : "View additional precreated profiles (Chloe, Robert, Dr. Vance, Coordinator Sarah)"}
            {showMoreProfiles ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {showMoreProfiles && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => applyPrecreatedState("chloe")}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 text-left cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900">Chloe Martinez</div>
                <div className="text-[10px] text-slate-500">Healthy Control Student</div>
                <div className="text-[9px] font-mono text-slate-400 mt-1">chloe_student / student123</div>
              </button>

              <button
                type="button"
                onClick={() => applyPrecreatedState("robert")}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-purple-500 text-left cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900">Robert Chen</div>
                <div className="text-[10px] text-slate-500">T2D Metabolic Patient</div>
                <div className="text-[9px] font-mono text-slate-400 mt-1">robert_patient / patient123</div>
              </button>

              <button
                type="button"
                onClick={() => applyPrecreatedState("pi_vance")}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-sky-500 text-left cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900">Dr. Elena Vance</div>
                <div className="text-[10px] text-slate-500">Endocrinology PI</div>
                <div className="text-[9px] font-mono text-slate-400 mt-1">pi_vance / vance123</div>
              </button>

              <button
                type="button"
                onClick={() => applyPrecreatedState("coordinator_sarah")}
                className="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-purple-500 text-left cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-900">Sarah Lindquist</div>
                <div className="text-[10px] text-slate-500">Lead Coordinator</div>
                <div className="text-[9px] font-mono text-slate-400 mt-1">coordinator_sarah / researcher123</div>
              </button>
            </div>
          )}
        </div>

        {/* The Sign In Form: Allows logging in yourself */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {mode === "login" ? "Enter Credentials to Sign In" : "Register Universal Volunteer Profile"}
              </h2>
              <p className="text-xs text-slate-500">
                Type in your username and password, or click one of the precreated states above.
              </p>
            </div>
            {activeDetectedState ? (
              <Badge className={activeDetectedState === "sso_pi_profile" ? "bg-emerald-600 text-white text-[10px]" : "bg-sky-600 text-white text-[10px]"}>
                {activeDetectedState === "sso_pi_profile" ? "SSO PI State" : "User Profile State"}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] text-slate-500">
                Standard Auth
              </Badge>
            )}
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
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-700 font-semibold">
                  Username or Staff ID / SSO
                </Label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {username ? username : "Type or load state above"}
                </span>
              </div>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. marcus_volunteer or pi_whitman"
                required
                className="font-mono text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-slate-700 font-semibold">Password</Label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {showPassword ? "Hide password" : "Show password"}
                </button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="font-mono text-xs sm:text-sm pr-10"
                />
              </div>
            </div>

            {/* Dynamic Active State Indicator */}
            {activeDetectedState === "user_profile" && (
              <div className="rounded-xl bg-sky-50 border border-sky-200 p-3 text-xs text-sky-800 flex items-center gap-2">
                <UserCircle2 className="h-4 w-4 text-sky-600 shrink-0" />
                <span>
                  <strong>Active State:</strong> Logging in as <strong>Marcus Davis</strong> will open the <strong>Volunteer Participant Dashboard</strong> with his $650 matched study.
                </span>
              </div>
            )}

            {activeDetectedState === "sso_pi_profile" && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Active State:</strong> Logging in as <strong>Dr. H. Whitman, MD</strong> will authenticate via <strong>Institutional SSO</strong> and open the <strong>PI Protocol Workspace</strong>.
                </span>
              </div>
            )}

            <Button
              type="submit"
              disabled={loginMutation.isPending || registerMutation.isPending}
              className={`w-full font-bold h-10 cursor-pointer text-xs sm:text-sm transition-all ${
                activeDetectedState === "sso_pi_profile"
                  ? "bg-slate-900 hover:bg-slate-800 text-white"
                  : "bg-sky-600 hover:bg-sky-700 text-white"
              }`}
            >
              {loginMutation.isPending ? (
                "Authenticating with server..."
              ) : mode === "login" ? (
                activeDetectedState === "user_profile" ? (
                  "Sign In as Marcus Davis (User Profile) →"
                ) : activeDetectedState === "sso_pi_profile" ? (
                  "Sign In via Institutional SSO (Dr. Whitman) →"
                ) : (
                  "Sign In to Account →"
                )
              ) : (
                "Create Profile Account"
              )}
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
              Dedicated Institutional SSO Gateway
            </div>
            <p className="text-[11px] text-slate-500">
              Access the high-security Institutional Portal for IRB compliance officers and site directors.
            </p>
          </div>
          <Link href="/institution/login">
            <Button variant="outline" size="sm" className="text-xs font-bold shrink-0 self-start sm:self-center border-slate-300 hover:bg-slate-900 hover:text-white transition-colors cursor-pointer">
              Institutional SSO
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          <span>Encrypted participant health data and 21 CFR Part 11 compliant audit trail.</span>
        </div>
      </div>
    </div>
  );
}
