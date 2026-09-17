import { useState } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  Stethoscope,
  Microscope,
  LockKeyhole,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PI_ACCOUNTS, PIData } from "./Login";
import { StudyLoopLogo } from "@/components/StudyLoopLogo";

export default function InstitutionLogin() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.loginWithCredentials.useMutation({
    onSuccess: (data) => {
      const uname = (data.user.username || "").toLowerCase();
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

      toast.success(`Welcome back, ${matchedPI.name}!`, {
        description: `Accessing Protocol Portal: ${matchedPI.studyTitle}`,
      });
      setLocation(`/researchers?studySlug=${encodeURIComponent(matchedPI.studySlug)}`);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to sign in. Please verify your credentials.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  const handlePILogin = (pi: PIData) => {
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
      description: `Entering protocol portal for ${pi.studyTitle}`,
    });

    setLocation(`/researchers?studySlug=${encodeURIComponent(pi.studySlug)}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-10 px-4 sm:px-6">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to StudyLoop Home
          </Link>
          <Badge variant="outline" className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-xs py-0.5 px-2.5 font-semibold">
            Institutional Single Sign-On
          </Badge>
        </div>

        <div className="text-center space-y-2 pt-2">
          <div className="flex justify-center mb-2">
            <StudyLoopLogo size={52} rounded="2xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Research Institution & PI Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Direct investigator login to manage active clinical trial protocols, IRB documentation, and pre-screened candidate queues.
          </p>
        </div>

        {/* PI Quick Selection Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <Stethoscope className="h-4 w-4 text-sky-400" />
                Principal Investigator Study Portals
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select your protocol to enter the dedicated clinical investigator workspace:
              </p>
            </div>
            <Badge className="bg-sky-600 text-white text-[10px] shrink-0">
              Verified Sites
            </Badge>
          </div>

          <div className="space-y-3">
            {PI_ACCOUNTS.map((pi) => {
              const isCoordinator = pi.id === "coordinator_sarah";
              return (
                <div
                  key={pi.id}
                  className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-sky-500/60 hover:bg-slate-800/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                        {pi.name}
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          isCoordinator
                            ? "text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold"
                            : "text-[9px] bg-sky-500/10 text-sky-400 border-sky-500/30 font-semibold"
                        }
                      >
                        {isCoordinator ? "Lead Coordinator" : pi.title}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {pi.institution}
                    </div>
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 pt-0.5">
                      <Microscope className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{pi.studyTitle}</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      IRB: {pi.irbNumber} • Stipend: {pi.compensation}
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handlePILogin(pi)}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shrink-0 self-start sm:self-center"
                  >
                    {isCoordinator ? "Enter Coordinator Ops" : "Enter Study Portal"}
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Institutional Credentials Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">Custom Institutional Staff Credentials</h3>
              <p className="text-xs text-slate-400">Sign in with your university or hospital staff login</p>
            </div>
            <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-300">
              IRB Security
            </Badge>
          </div>

          <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between gap-2">
            <div className="text-xs">
              <div className="font-bold text-slate-200">Precreated SSO PI Profile: Dr. H. Whitman, MD</div>
              <div className="text-[11px] font-mono text-slate-400">pi_whitman / whitman123</div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setUsername("pi_whitman");
                setPassword("whitman123");
                toast.info("SSO credentials loaded for Dr. Whitman");
              }}
              className="text-xs font-semibold border-slate-700 text-slate-300 hover:bg-slate-800 h-7"
            >
              Load SSO State
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold">Staff Username / ID</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. coordinator_sarah or pi_whitman"
                required
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-sky-500"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-slate-300 font-semibold">Institutional Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-sky-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold h-10 border border-slate-700"
            >
              {loginMutation.isPending ? "Authenticating Institution..." : "Sign In to Researcher Workspace"}
            </Button>
          </form>
        </div>

        {/* Cross-Audience Isolation Link */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-400">
            Looking to join or participate in a clinical trial as a volunteer?{" "}
            <Link href="/login" className="text-sky-400 hover:text-sky-300 font-bold underline underline-offset-2">
              Go to Volunteer Participant Sign In →
            </Link>
          </p>
        </div>

        {/* Footer Trust */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-4">
          <ShieldCheck className="h-4 w-4 text-slate-400" />
          <span>IRB-compliant credential exchange and HIPAA/21 CFR Part 11 encrypted candidate pipeline.</span>
        </div>
      </div>
    </div>
  );
}
