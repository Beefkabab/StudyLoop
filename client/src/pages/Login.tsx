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
  LockKeyhole,
  Video,
  Play,
  Stethoscope,
  Microscope,
  Zap,
  RotateCcw
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
  const [activeTab, setActiveTab] = useState<"participants" | "investigators">("participants");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isAutoTyping, setIsAutoTyping] = useState(false);

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

  // Instant 1-Click Consumer Persona Login
  const handleConsumerPersonaLogin = (persona: "marcus" | "chloe" | "robert") => {
    localStorage.removeItem("studyloop_active_pi");
    if (persona === "marcus") {
      localStorage.setItem("studyloop_profile_key", "demo_profile_rural_male");
      const user = { id: 1, name: "Marcus Davis", email: "marcus.davis92@example.com", role: "user" };
      localStorage.setItem("studyloop_session_user", JSON.stringify(user));
      toast.success("Signed in as Marcus Davis (Rural Male Volunteer)", {
        description: "Navigating to Participant Dashboard with $650 matched study.",
      });
    } else if (persona === "chloe") {
      localStorage.setItem("studyloop_profile_key", "demo_profile_urban_student");
      const user = { id: 2, name: "Chloe Martinez", email: "chloe.m.student@example.edu", role: "user" };
      localStorage.setItem("studyloop_session_user", JSON.stringify(user));
      toast.success("Signed in as Chloe Martinez (Urban Student)", {
        description: "Navigating to Healthy Control Dashboard.",
      });
    } else {
      localStorage.setItem("studyloop_profile_key", "demo_profile_chronic_patient");
      const user = { id: 3, name: "Robert Chen", email: "robert.chen.t2d@example.org", role: "user" };
      localStorage.setItem("studyloop_session_user", JSON.stringify(user));
      toast.success("Signed in as Robert Chen (T2D Patient)", {
        description: "Navigating to Metabolic Trial Dashboard.",
      });
    }
    setLocation("/dashboard");
  };

  // Instant 1-Click PI Persona Login
  const handlePIPersonaLogin = (piId: string) => {
    const pi = PI_ACCOUNTS.find((p) => p.id === piId);
    if (!pi) return;

    const user = {
      id: pi.id,
      name: pi.name,
      title: pi.title,
      email: `${pi.id}@studyloop.org`,
      role: "researcher",
      institution: pi.institution,
      assignedStudySlug: pi.studySlug,
      assignedStudyTitle: pi.studyTitle,
    };

    localStorage.setItem("studyloop_session_user", JSON.stringify(user));
    localStorage.setItem("studyloop_active_pi", JSON.stringify(pi));
    localStorage.setItem("studyloop_active_study_slug", pi.studySlug);

    toast.success(`Authenticated as ${pi.name}`, {
      description: `Entering protocol portal for "${pi.studyTitle}"`,
    });

    setLocation(`/researchers?studySlug=${encodeURIComponent(pi.studySlug)}`);
  };

  // Realistic live typewriter simulation for video screencasts
  const simulateVideoTyping = async (
    targetUser: string,
    targetPass: string,
    personaLabel: string,
    onFinish: () => void
  ) => {
    if (isAutoTyping) return;
    setIsAutoTyping(true);
    setMode("login");
    setUsername("");
    setPassword("");

    toast.info(`🎥 Video Simulation: Auto-typing credentials for ${personaLabel}...`);

    for (let i = 1; i <= targetUser.length; i++) {
      setUsername(targetUser.slice(0, i));
      await new Promise((r) => setTimeout(r, 35));
    }
    await new Promise((r) => setTimeout(r, 120));
    for (let i = 1; i <= targetPass.length; i++) {
      setPassword(targetPass.slice(0, i));
      await new Promise((r) => setTimeout(r, 35));
    }
    await new Promise((r) => setTimeout(r, 200));
    setIsAutoTyping(false);
    onFinish();
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
              Two-Sided Healthcare Marketplace
            </Badge>
            <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-0.5 px-2.5 flex items-center gap-1 shadow-xs">
              <Video className="h-3 w-3" />
              MVP Video Demo Suite
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            StudyLoop Authentication Simulation
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            Select a verified persona below for seamless, 1-click video recordings, or use the interactive typewriter feature to demonstrate live credential sign-in on camera.
          </p>
        </div>

        {/* Persona Selector Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("participants")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "participants"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <UserCircle2 className="h-4 w-4" />
            Volunteer Participants (Consumer Side)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("investigators")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "investigators"
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Stethoscope className="h-4 w-4" />
            Investigators & Staff (Institutional Side)
          </button>
        </div>

        {/* Tab Content: Volunteer Participants */}
        {activeTab === "participants" && (
          <div className="bg-white p-5 rounded-2xl border border-sky-100 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Participant Personas for Video Walkthrough:
              </span>
              <span className="text-[10px] text-slate-400 font-medium">1-Click or Auto-Type</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Persona 1: Marcus */}
              <div className="p-3.5 rounded-xl border border-slate-200 hover:border-sky-400 bg-slate-50/50 hover:bg-sky-50/30 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                      MD
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      Diversity Target
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Marcus Davis</div>
                    <div className="text-[11px] text-slate-500">Rural Male Volunteer (34)</div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-1">
                      Matched: Neural Resilience ($650)
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handleConsumerPersonaLogin("marcus")}
                    className="w-full bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold h-8 cursor-pointer"
                  >
                    <Zap className="h-3 w-3 mr-1 text-amber-300" />
                    1-Click Entry
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isAutoTyping}
                    onClick={() =>
                      simulateVideoTyping(
                        "marcus_volunteer",
                        "password123",
                        "Marcus Davis",
                        () => handleConsumerPersonaLogin("marcus")
                      )
                    }
                    className="w-full text-[11px] text-slate-600 hover:text-slate-900 border-slate-200 h-7 cursor-pointer"
                  >
                    <Play className="h-2.5 w-2.5 mr-1 text-red-500" />
                    🎥 Auto-Type on Video
                  </Button>
                </div>
              </div>

              {/* Persona 2: Chloe */}
              <div className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 bg-slate-50/50 hover:bg-teal-50/30 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                      CM
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-teal-50 text-teal-700 border-teal-200">
                      Healthy Control
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Chloe Martinez</div>
                    <div className="text-[11px] text-slate-500">Urban Student (22)</div>
                    <div className="text-[10px] text-teal-600 font-medium mt-1">
                      Matched: Immunology ($250)
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handleConsumerPersonaLogin("chloe")}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold h-8 cursor-pointer"
                  >
                    <Zap className="h-3 w-3 mr-1 text-amber-300" />
                    1-Click Entry
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isAutoTyping}
                    onClick={() =>
                      simulateVideoTyping(
                        "chloe_student",
                        "password123",
                        "Chloe Martinez",
                        () => handleConsumerPersonaLogin("chloe")
                      )
                    }
                    className="w-full text-[11px] text-slate-600 hover:text-slate-900 border-slate-200 h-7 cursor-pointer"
                  >
                    <Play className="h-2.5 w-2.5 mr-1 text-red-500" />
                    🎥 Auto-Type on Video
                  </Button>
                </div>
              </div>

              {/* Persona 3: Robert */}
              <div className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-400 bg-slate-50/50 hover:bg-purple-50/30 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                      RC
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-purple-50 text-purple-700 border-purple-200">
                      Metabolic Trial
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Robert Chen</div>
                    <div className="text-[11px] text-slate-500">T2D Patient (58)</div>
                    <div className="text-[10px] text-purple-600 font-medium mt-1">
                      Matched: Oral GLP-1 ($1,850)
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handleConsumerPersonaLogin("robert")}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold h-8 cursor-pointer"
                  >
                    <Zap className="h-3 w-3 mr-1 text-amber-300" />
                    1-Click Entry
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isAutoTyping}
                    onClick={() =>
                      simulateVideoTyping(
                        "robert_patient",
                        "password123",
                        "Robert Chen",
                        () => handleConsumerPersonaLogin("robert")
                      )
                    }
                    className="w-full text-[11px] text-slate-600 hover:text-slate-900 border-slate-200 h-7 cursor-pointer"
                  >
                    <Play className="h-2.5 w-2.5 mr-1 text-red-500" />
                    🎥 Auto-Type on Video
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Investigators & Staff */}
        {activeTab === "investigators" && (
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-sky-400" />
                Investigator Personas for Video Walkthrough:
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Protocol & IRB Portal</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* PI 1: Dr. Whitman */}
              <div className="p-3.5 rounded-xl border border-slate-800 hover:border-sky-500/60 bg-slate-950/60 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px] bg-sky-500/10 text-sky-400 border-sky-500/30">
                      PI • Aging Core
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-mono">Pro00109482</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Dr. H. Whitman, MD</div>
                    <div className="text-[11px] text-slate-400">Triangle Aging & Brain Sciences</div>
                    <div className="text-[10px] text-sky-400 font-medium mt-1">
                      Neural Resilience Study ($650)
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handlePIPersonaLogin("pi_whitman")}
                    className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold h-8 cursor-pointer"
                  >
                    <Zap className="h-3 w-3 mr-1 text-amber-300" />
                    Enter Protocol
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isAutoTyping}
                    onClick={() =>
                      simulateVideoTyping(
                        "pi_whitman",
                        "irb_whitman_2026",
                        "Dr. H. Whitman",
                        () => handlePIPersonaLogin("pi_whitman")
                      )
                    }
                    className="w-full text-[11px] text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800 h-7 cursor-pointer"
                  >
                    <Play className="h-2.5 w-2.5 mr-1 text-red-400" />
                    🎥 Auto-Type on Video
                  </Button>
                </div>
              </div>

              {/* PI 2: Dr. Vance */}
              <div className="p-3.5 rounded-xl border border-slate-800 hover:border-teal-500/60 bg-slate-950/60 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px] bg-teal-500/10 text-teal-400 border-teal-500/30">
                      PI • Endocrinology
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-mono">IND-189302</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Dr. Elena Vance, MD</div>
                    <div className="text-[11px] text-slate-400">Apex Pharma Therapeutics</div>
                    <div className="text-[10px] text-teal-400 font-medium mt-1">
                      Phase II Oral GLP-1 ($1,850)
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handlePIPersonaLogin("pi_vance")}
                    className="w-full bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold h-8 cursor-pointer"
                  >
                    <Zap className="h-3 w-3 mr-1 text-amber-300" />
                    Enter Protocol
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isAutoTyping}
                    onClick={() =>
                      simulateVideoTyping(
                        "pi_vance",
                        "irb_vance_2026",
                        "Dr. Elena Vance",
                        () => handlePIPersonaLogin("pi_vance")
                      )
                    }
                    className="w-full text-[11px] text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800 h-7 cursor-pointer"
                  >
                    <Play className="h-2.5 w-2.5 mr-1 text-red-400" />
                    🎥 Auto-Type on Video
                  </Button>
                </div>
              </div>

              {/* PI 3: Sarah Coordinator */}
              <div className="p-3.5 rounded-xl border border-slate-800 hover:border-purple-500/60 bg-slate-950/60 transition-all flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/30">
                      Lead Coordinator
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-mono">Multi-Site</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Sarah Lindquist, CRC</div>
                    <div className="text-[11px] text-slate-400">Triangle Trials Operations</div>
                    <div className="text-[10px] text-purple-400 font-medium mt-1">
                      All Active Study Protocols
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <Button
                    size="sm"
                    onClick={() => handlePIPersonaLogin("coordinator_sarah")}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold h-8 cursor-pointer"
                  >
                    <Zap className="h-3 w-3 mr-1 text-amber-300" />
                    Coordinator Ops
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isAutoTyping}
                    onClick={() =>
                      simulateVideoTyping(
                        "coordinator_sarah",
                        "crc_operations_2026",
                        "Sarah Lindquist",
                        () => handlePIPersonaLogin("coordinator_sarah")
                      )
                    }
                    className="w-full text-[11px] text-slate-300 hover:text-white border-slate-700 hover:bg-slate-800 h-7 cursor-pointer"
                  >
                    <Play className="h-2.5 w-2.5 mr-1 text-red-400" />
                    🎥 Auto-Type on Video
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Standard Credentials Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-7 space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {mode === "login" ? "Standard Credentials Sign In" : "Register Universal Volunteer Profile"}
              </h2>
              <p className="text-xs text-slate-500">
                {isAutoTyping ? "Typing simulation in progress..." : "Sign in with your email or staff username"}
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px] bg-slate-100">
              Interactive Form
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
              <Label className="text-xs text-slate-700 font-semibold">Username / Staff ID</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. marcus_volunteer or pi_whitman"
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
              disabled={loginMutation.isPending || registerMutation.isPending || isAutoTyping}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold h-10 cursor-pointer"
            >
              {loginMutation.isPending ? "Authenticating..." : mode === "login" ? "Sign In" : "Create Profile Account"}
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
              Dedicated Research Institutional SSO Portal
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
