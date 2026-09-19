import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Sparkles,
  ClipboardCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  MapPin,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Calendar,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  LogOut,
  UserCircle2,
  Search,
  Check,
  X,
  FileText,
  HelpCircle,
  ArrowUpRight,
  Layers,
  History,
  Activity,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StudyCard } from "@/components/StudyCard";
import { toast } from "sonner";

export default function MyStudies() {
  const [, setLocation] = useLocation();
  const [profileKey, setProfileKey] = useState<string>("");
  const [activeSection, setActiveSection] = useState<"in_progress" | "active" | "recommended" | "history">("in_progress");

  // Task completion modal
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Withdraw modal
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [appToWithdraw, setAppToWithdraw] = useState<any | null>(null);
  const [withdrawReason, setWithdrawReason] = useState("");

  useEffect(() => {
    let key = localStorage.getItem("studyloop_profile_key") || "";
    // If user has demo profile key or session user, load it
    if (!key) {
      const sessionUser = localStorage.getItem("studyloop_session_user");
      if (sessionUser) {
        try {
          const user = JSON.parse(sessionUser);
          if (user.role === "user") {
            key = "demo_profile_rural_male";
            localStorage.setItem("studyloop_profile_key", key);
          }
        } catch {}
      }
    }
    setProfileKey(key);
  }, []);

  const { data: profile } = trpc.profile.get.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  const { data: completionData } = trpc.profile.completionStatus.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  const {
    data: lifecycleData,
    isLoading: isLifecycleLoading,
    refetch: refetchLifecycle
  } = trpc.applications.getLifecycleOverview.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  const completeTaskMutation = trpc.tasks.complete.useMutation({
    onSuccess: () => {
      toast.success("Task completed successfully!", {
        description: "The study coordinator has been notified of your update.",
      });
      setTaskModalOpen(false);
      setSelectedTask(null);
      refetchLifecycle();
    },
    onError: (err) => toast.error(err.message),
  });

  const withdrawMutation = trpc.applications.withdraw.useMutation({
    onSuccess: () => {
      toast.info("Application withdrawn", {
        description: "Your withdrawal was recorded and the site has been updated.",
      });
      setWithdrawModalOpen(false);
      setAppToWithdraw(null);
      setWithdrawReason("");
      refetchLifecycle();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleLoadDemo = () => {
    localStorage.setItem("studyloop_profile_key", "demo_profile_rural_male");
    setProfileKey("demo_profile_rural_male");
    toast.success("Loaded demo participant (Marcus Davis)");
  };

  const handleClearSession = () => {
    localStorage.removeItem("studyloop_profile_key");
    localStorage.removeItem("studyloop_session_user");
    setProfileKey("");
    toast.info("Switched to guest view");
  };

  const inProgressCount = lifecycleData?.counts.inProgress || 0;
  const activeCount = lifecycleData?.counts.active || 0;
  const recommendedCount = lifecycleData?.counts.recommended || 0;
  const historyCount = lifecycleData?.counts.history || 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Medical & Clinical Advisory Disclaimer */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 text-xs py-2 px-4">
        <div className="container flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-sky-400 shrink-0" />
            <span className="text-slate-300">
              <strong className="text-white font-semibold">Participant Advisory: </strong>
              StudyLoop does not provide medical advice or determine clinical eligibility. All eligibility criteria are evaluated exclusively by authorized study research teams.
            </span>
          </div>
          <Link href="/trust" className="text-sky-300 hover:text-white underline shrink-0 hidden md:inline">
            Trust & Security Details
          </Link>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-white border-b border-slate-200 py-8 shadow-xs">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-semibold">
                  Participant Lifecycle Platform
                </Badge>
                {profile && (
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-medium">
                    Profile Verified
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {profile ? `My Studies — ${profile.fullName}` : "Participant Study Hub"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Always know your real-time application status, pending requirements, and scheduled milestones without waiting on back-and-forth emails.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {profile ? (
                <>
                  <Link href="/profile">
                    <Button variant="outline" size="sm" className="text-xs h-9 font-semibold">
                      <UserCircle2 className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                      Edit Passport ({completionData?.percentage || 100}%)
                    </Button>
                  </Link>
                  <Link href="/settings/privacy-notifications">
                    <Button variant="outline" size="sm" className="text-xs h-9">
                      Privacy & Consents
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSession}
                    className="text-xs h-9 text-slate-500 hover:text-slate-900"
                    title="Sign out"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleLoadDemo}
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 border-sky-200 bg-sky-50 text-sky-700 font-semibold"
                  >
                    ✨ Load Marcus Davis (Demo Participant)
                  </Button>
                  <Link href="/profile">
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 font-semibold">
                      Create Passport
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Lifecycle Sections Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">
            <button
              onClick={() => setActiveSection("in_progress")}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                activeSection === "in_progress"
                  ? "bg-sky-50/70 border-sky-400 ring-2 ring-sky-400/20 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">In Progress</span>
                <ClipboardCheck className={`h-4 w-4 ${activeSection === "in_progress" ? "text-sky-600" : "text-slate-400"}`} />
              </div>
              <div className="text-2xl font-black text-slate-950 mt-2">{inProgressCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Submitted & reviews</p>
            </button>

            <button
              onClick={() => setActiveSection("active")}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                activeSection === "active"
                  ? "bg-purple-50/70 border-purple-400 ring-2 ring-purple-400/20 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Active Studies</span>
                <Activity className={`h-4 w-4 ${activeSection === "active" ? "text-purple-600" : "text-slate-400"}`} />
              </div>
              <div className="text-2xl font-black text-slate-950 mt-2">{activeCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Enrolled & visits</p>
            </button>

            <button
              onClick={() => setActiveSection("recommended")}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                activeSection === "recommended"
                  ? "bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Recommended for You</span>
                <Sparkles className={`h-4 w-4 ${activeSection === "recommended" ? "text-amber-600" : "text-slate-400"}`} />
              </div>
              <div className="text-2xl font-black text-slate-950 mt-2">{recommendedCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Top matches</p>
            </button>

            <button
              onClick={() => setActiveSection("history")}
              className={`p-4 rounded-xl border text-left transition-all relative ${
                activeSection === "history"
                  ? "bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Study History</span>
                <History className={`h-4 w-4 ${activeSection === "history" ? "text-slate-700" : "text-slate-400"}`} />
              </div>
              <div className="text-2xl font-black text-slate-950 mt-2">{historyCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Completed & past</p>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="container mt-8">
        {/* ==================== SECTION 1: IN PROGRESS ==================== */}
        {activeSection === "in_progress" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Applications In Progress</h2>
                <p className="text-xs text-slate-500">Track current status, coordinator reviews, and your required next actions.</p>
              </div>
              <span className="text-xs text-slate-400">{inProgressCount} active records</span>
            </div>

            {isLifecycleLoading ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-400">
                Loading study pipeline records...
              </div>
            ) : lifecycleData?.inProgress && lifecycleData.inProgress.length > 0 ? (
              <div className="space-y-5">
                {lifecycleData.inProgress.map(({ application, study, whatHappensNext, pendingTasks, hasActionRequired }) => (
                  <div
                    key={application.id}
                    className={`bg-white rounded-2xl border transition-all p-6 space-y-4 shadow-xs ${
                      hasActionRequired ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200"
                    }`}
                  >
                    {/* Header Row: Status & Timeline */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs font-bold px-3 py-1 ${application.statusColor}`}>
                          {application.statusLabel}
                        </Badge>
                        {hasActionRequired && (
                          <Badge className="bg-amber-500 text-white text-[10px] font-extrabold uppercase animate-pulse">
                            Action Required
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Updated {new Date(application.statusUpdatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Study Title & Organization */}
                    <div>
                      <Link href={`/study/${study.slug}`}>
                        <h3 className="text-lg font-bold text-slate-900 hover:text-sky-600 transition-colors">
                          {study.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 mt-1">
                        <strong>Site / Sponsor:</strong> {study.sponsorName} • Lead PI: {study.piName}
                        {application.assignedCoordinatorName && (
                          <span className="ml-2 text-sky-700 font-semibold">
                            • Coordinator: {application.assignedCoordinatorName}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Participant-Facing Note (Strictly NO Internal Researcher Notes) */}
                    {application.participantFacingNote && (
                      <div className="bg-sky-50/60 border border-sky-100 rounded-xl p-3.5 text-xs text-slate-700 leading-relaxed">
                        <strong className="text-sky-900 font-bold">Latest Coordinator Update: </strong>
                        {application.participantFacingNote}
                      </div>
                    )}

                    {/* "What happens next?" Guidance */}
                    <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                        <HelpCircle className="h-3.5 w-3.5 text-sky-600" />
                        What happens next?
                      </div>
                      <p>{whatHappensNext}</p>
                    </div>

                    {/* Pending Tasks & Next Action Requests */}
                    {pendingTasks && pendingTasks.length > 0 && (
                      <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            Required Actions for this Study ({pendingTasks.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {pendingTasks.map((task: any) => (
                            <div
                              key={task.id}
                              className="bg-white rounded-lg border border-amber-200 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                            >
                              <div>
                                <h4 className="text-xs font-bold text-slate-900">{task.title}</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">{task.description}</p>
                                {task.dueDate && (
                                  <span className="text-[10px] text-amber-700 font-semibold block mt-1">
                                    Due by {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedTask(task);
                                  setTaskModalOpen(true);
                                }}
                                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 h-8"
                              >
                                Complete Task <ChevronRight className="h-3.5 w-3.5 ml-1" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Footer Row: Compensation, Logistics & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
                      <div className="flex flex-wrap items-center gap-4 text-slate-600">
                        <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          ${study.compensationAmount} Compensation
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {study.timeCommitment}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-slate-400" />
                          {study.city}, {study.state} ({study.locationType.replace(/_/g, " ")})
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setAppToWithdraw(application);
                            setWithdrawModalOpen(true);
                          }}
                          className="text-xs text-slate-400 hover:text-red-600 h-8"
                        >
                          Withdraw
                        </Button>
                        <Link href={`/study/${study.slug}`}>
                          <Button variant="outline" size="sm" className="text-xs h-8 font-semibold">
                            Study Details <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">No active applications in progress</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Browse matching research opportunities to take a 2-minute pre-screener and begin participating.
                </p>
                <div className="pt-2">
                  <Link href="/browse">
                    <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold">
                      Explore Open Studies
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SECTION 2: ACTIVE STUDIES (ENROLLED) ==================== */}
        {activeSection === "active" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Active Enrolled Studies</h2>
                <p className="text-xs text-slate-500">Protocols where you are actively participating in study visits or remote tracking.</p>
              </div>
              <span className="text-xs text-slate-400">{activeCount} active trial{activeCount === 1 ? "" : "s"}</span>
            </div>

            {lifecycleData?.active && lifecycleData.active.length > 0 ? (
              <div className="space-y-5">
                {lifecycleData.active.map(({ application, study, whatHappensNext, pendingTasks }) => (
                  <div key={application.id} className="bg-white rounded-2xl border-2 border-purple-200 shadow-xs p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-100 pb-3">
                      <Badge className="bg-purple-600 text-white text-xs font-bold px-3 py-1">
                        Active Enrolled Participant
                      </Badge>
                      {application.appointmentDate && (
                        <div className="text-xs font-semibold text-purple-900 bg-purple-50 px-3 py-1 rounded-full border border-purple-200 flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-purple-600" />
                          Next Visit: {new Date(application.appointmentDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    <div>
                      <Link href={`/study/${study.slug}`}>
                        <h3 className="text-lg font-bold text-slate-900 hover:text-sky-600 transition-colors">
                          {study.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 mt-1">
                        {study.sponsorName} • Protocol Site: {study.facilityAddress || `${study.city}, ${study.state}`}
                      </p>
                    </div>

                    {application.participantFacingNote && (
                      <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-3.5 text-xs text-purple-950 leading-relaxed">
                        <strong>Protocol Milestone: </strong>
                        {application.participantFacingNote}
                      </div>
                    )}

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600">
                      <strong>Next Required Participation: </strong>
                      {whatHappensNext}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
                      <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        ${study.compensationAmount} Total Stipend ({study.compensationSchedule || study.compensationType})
                      </span>
                      <Link href={`/study/${study.slug}`}>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Protocol Information <ChevronRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">No active enrollments yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Once your pre-screening passes and the study team confirms your informed consent, your active trial schedule will appear here.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== SECTION 3: RECOMMENDED FOR YOU ==================== */}
        {activeSection === "recommended" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Recommended for Your Profile</h2>
                <p className="text-xs text-slate-500">
                  Tailored based on your age, location, and health profile preferences.
                </p>
              </div>
              <Link href="/browse" className="text-xs font-bold text-sky-600 hover:underline flex items-center gap-1">
                Browse all studies <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {lifecycleData?.recommended && lifecycleData.recommended.length > 0 ? (
              <div className="space-y-4">
                {lifecycleData.recommended.map((study) => (
                  <StudyCard key={study.id} study={study} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Complete your profile to unlock recommendations</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Tell us your location, age bracket, and study preferences to receive personalized research matches.
                </p>
                <div className="pt-2">
                  <Link href="/profile">
                    <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold">
                      Complete Health Profile
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== SECTION 4: STUDY HISTORY & ALTERNATIVES ==================== */}
        {activeSection === "history" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Study History</h2>
                <p className="text-xs text-slate-500">Past, completed, or closed applications and recommended alternatives.</p>
              </div>
              <span className="text-xs text-slate-400">{historyCount} archive record{historyCount === 1 ? "" : "s"}</span>
            </div>

            {lifecycleData?.history && lifecycleData.history.length > 0 ? (
              <div className="space-y-6">
                {lifecycleData.history.map(({ application, study, whatHappensNext, recommendedAlternatives }) => (
                  <div key={application.id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <Badge variant="outline" className={`text-xs font-bold px-2.5 py-0.5 ${application.statusColor}`}>
                        {application.statusLabel}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {new Date(application.statusUpdatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <Link href={`/study/${study.slug}`}>
                        <h3 className="text-base font-bold text-slate-900 hover:text-sky-600 transition-colors">
                          {study.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">{study.sponsorName}</p>
                    </div>

                    {/* Respectful Status Explanation */}
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-800">Status Explanation: </strong>
                      {application.participantFacingNote || whatHappensNext}
                    </div>

                    {/* Recommended Alternative Studies */}
                    {recommendedAlternatives && recommendedAlternatives.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-sky-800 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                            Recommended Alternative Opportunities for You:
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {recommendedAlternatives.map((alt) => (
                            <Link key={alt.id} href={`/study/${alt.slug}`}>
                              <div className="p-3 bg-slate-50 hover:bg-sky-50/50 border border-slate-200 hover:border-sky-300 rounded-xl transition-all cursor-pointer">
                                <h4 className="text-xs font-bold text-slate-900 truncate">{alt.title}</h4>
                                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                                  <span className="font-extrabold text-emerald-700">${alt.compensationAmount}</span>
                                  <span>{alt.city}, {alt.state}</span>
                                  <span className="text-sky-600 font-semibold flex items-center gap-0.5">
                                    View <ChevronRight className="h-3 w-3" />
                                  </span>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                  <History className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">No study history recorded yet</h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                  Completed, closed, or withdrawn study records will be permanently archived here for your records.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Task Completion Modal */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-slate-900">
              {selectedTask?.title || "Complete Study Task"}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {selectedTask?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3 text-xs text-slate-600">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-800">Coordinator Request:</p>
              <p className="text-slate-500 mt-1">
                Completing this action allows Coordinator Sarah to advance your application to the next review step.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setTaskModalOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={completeTaskMutation.isPending}
              onClick={() => {
                if (selectedTask && profileKey) {
                  completeTaskMutation.mutate({
                    taskId: selectedTask.id,
                    profileKey,
                  });
                }
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
            >
              {completeTaskMutation.isPending ? "Updating..." : "Mark as Completed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={withdrawModalOpen} onOpenChange={setWithdrawModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-slate-900">
              Withdraw Application
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Are you sure you wish to withdraw from this study? You can reapply or participate in other studies anytime.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <label className="text-xs font-semibold text-slate-700">Reason (Optional):</label>
            <Textarea
              value={withdrawReason}
              onChange={(e) => setWithdrawReason(e.target.value)}
              placeholder="e.g., Schedule conflict, transport limitations, or personal decision"
              className="text-xs min-h-[80px]"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setWithdrawModalOpen(false)} className="text-xs">
              Keep Application
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={withdrawMutation.isPending}
              onClick={() => {
                if (appToWithdraw && profileKey) {
                  withdrawMutation.mutate({
                    applicationId: appToWithdraw.id,
                    profileKey,
                    reason: withdrawReason,
                  });
                }
              }}
              className="text-xs font-bold"
            >
              {withdrawMutation.isPending ? "Withdrawing..." : "Confirm Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
