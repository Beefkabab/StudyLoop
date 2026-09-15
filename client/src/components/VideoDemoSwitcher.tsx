import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Video, 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  Stethoscope, 
  Sparkles, 
  LogOut, 
  Eye, 
  EyeOff,
  Layers,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PI_ACCOUNTS } from "@/pages/Login";

export function VideoDemoSwitcher() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Sync active user from localStorage whenever route changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem("studyloop_session_user");
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  }, [location]);

  const switchParticipant = (persona: "marcus" | "chloe" | "robert") => {
    if (persona === "marcus") {
      localStorage.setItem("studyloop_profile_key", "demo_profile_rural_male");
      const user = { id: 1, name: "Marcus Davis", email: "marcus.davis92@example.com", role: "user" };
      localStorage.setItem("studyloop_session_user", JSON.stringify(user));
      localStorage.removeItem("studyloop_active_pi");
      toast.success("Switched to Marcus Davis (Participant)", {
        description: "Viewing Rural Male Volunteer Profile & Trials.",
      });
    } else if (persona === "chloe") {
      localStorage.setItem("studyloop_profile_key", "demo_profile_urban_student");
      const user = { id: 2, name: "Chloe Martinez", email: "chloe.m.student@example.edu", role: "user" };
      localStorage.setItem("studyloop_session_user", JSON.stringify(user));
      localStorage.removeItem("studyloop_active_pi");
      toast.success("Switched to Chloe Martinez (Participant)", {
        description: "Viewing Healthy Control Student Profile & Trials.",
      });
    } else {
      localStorage.setItem("studyloop_profile_key", "demo_profile_chronic_patient");
      const user = { id: 3, name: "Robert Chen", email: "robert.chen.t2d@example.org", role: "user" };
      localStorage.setItem("studyloop_session_user", JSON.stringify(user));
      localStorage.removeItem("studyloop_active_pi");
      toast.success("Switched to Robert Chen (Participant)", {
        description: "Viewing Type 2 Diabetes Patient Profile & Trials.",
      });
    }
    setIsOpen(false);
    setLocation("/dashboard");
  };

  const switchPI = (piId: string) => {
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

    toast.success(`Switched to ${pi.name} (PI Portal)`, {
      description: `Viewing Protocol: ${pi.studyTitle}`,
    });

    setIsOpen(false);
    setLocation(`/researchers?studySlug=${encodeURIComponent(pi.studySlug)}`);
  };

  const handleResetToLogin = () => {
    localStorage.removeItem("studyloop_session_user");
    localStorage.removeItem("studyloop_active_pi");
    setCurrentUser(null);
    setIsOpen(false);
    toast.info("Session Cleared", { description: "Returned to Login Simulation Screen." });
    setLocation("/login");
  };

  // If minimized to a tiny circle icon
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          title="Restore Video Demo Switcher"
          className="h-11 w-11 rounded-full bg-slate-900 text-white shadow-xl hover:bg-sky-600 flex items-center justify-center transition-all hover:scale-105 border border-slate-700 cursor-pointer"
        >
          <Video className="h-5 w-5 text-amber-400" />
        </button>
      </div>
    );
  }

  return (
    <aside aria-label="MVP Video Demo Simulation Control" className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
      <div className="pointer-events-auto">
        {/* Expanded Panel */}
        {isOpen && (
          <div className="mb-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 text-white border border-slate-700 shadow-2xl backdrop-blur-xl p-4 space-y-3.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                  <Video className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-tight text-white flex items-center gap-1.5">
                    MVP Video Demo Switcher
                    <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 h-4">LIVE</Badge>
                  </h4>
                  <p className="text-[10px] text-slate-400">1-click role swapping for pitch & demo videos</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {/* Current Active Persona */}
            <div className="bg-slate-800/80 rounded-xl p-2.5 flex items-center justify-between border border-slate-700/60">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-slate-400">Current View:</span>
                <span className="text-xs font-bold text-white truncate max-w-[160px]">
                  {currentUser?.name || "Visitor / Logged Out"}
                </span>
              </div>
              <Badge variant="outline" className="text-[9px] border-slate-600 text-slate-300">
                {currentUser?.role === "researcher" ? "Researcher" : currentUser?.role === "user" ? "Participant" : "Guest"}
              </Badge>
            </div>

            {/* Participant Quick Switches */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                Volunteer Personas (Participant Side)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => switchParticipant("marcus")}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-sky-950/70 hover:border-sky-500 border border-slate-700 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-sky-300">Marcus Davis</div>
                  <div className="text-[10px] text-slate-400">Rural Male ($650)</div>
                </button>
                <button
                  type="button"
                  onClick={() => switchParticipant("chloe")}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-teal-950/70 hover:border-teal-500 border border-slate-700 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-teal-300">Chloe Martinez</div>
                  <div className="text-[10px] text-slate-400">Healthy Control ($250)</div>
                </button>
              </div>
            </div>

            {/* Researcher Quick Switches */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <Stethoscope className="h-3 w-3" />
                Investigator Personas (PI Side)
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => switchPI("pi_whitman")}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-emerald-950/70 hover:border-emerald-500 border border-slate-700 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300">Dr. Whitman, MD</div>
                  <div className="text-[10px] text-slate-400">Neural Resilience PI</div>
                </button>
                <button
                  type="button"
                  onClick={() => switchPI("coordinator_sarah")}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-purple-950/70 hover:border-purple-500 border border-slate-700 text-left transition-all cursor-pointer group"
                >
                  <div className="text-xs font-bold text-white group-hover:text-purple-300">Sarah Lindquist</div>
                  <div className="text-[10px] text-slate-400">Lead Coordinator (All)</div>
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
              <button
                type="button"
                onClick={handleResetToLogin}
                className="text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Clear & Go to Login
              </button>
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <EyeOff className="h-3.5 w-3.5" />
                Hide for Recording
              </button>
            </div>
          </div>
        )}

        {/* Collapsed Pill Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-900/90 text-white border border-slate-700 shadow-xl hover:bg-slate-800 hover:border-sky-500 transition-all cursor-pointer group backdrop-blur-md"
          >
            <div className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <Video className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200 group-hover:text-white">
              🎬 Video Demo: {currentUser ? currentUser.name.split(" ")[0] : "Select Persona"}
            </span>
            {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronUp className="h-3.5 w-3.5 text-slate-400" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
