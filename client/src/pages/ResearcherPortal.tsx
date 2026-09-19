import { useMemo, useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Download,
  Filter,
  GraduationCap,
  LayoutDashboard,
  ListFilter,
  Loader2,
  MapPinned,
  MoreHorizontal,
  MousePointerClick,
  Plus,
  Search,
  Send,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Target,
  Users,
  UsersRound,
  UserRoundCheck,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  AlertCircle,
  Archive,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateStudyModal } from "@/components/CreateStudyModal";
import { toast } from "sonner";

export const lifecycleStatusConfig: Record<string, { label: string; className: string; desc: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600 border-slate-200", desc: "Application started but not yet submitted" },
  submitted: { label: "Submitted", className: "bg-sky-50 text-sky-800 border-sky-200", desc: "Submitted, awaiting initial coordinator review" },
  under_review: { label: "Under Review", className: "bg-indigo-50 text-indigo-800 border-indigo-200", desc: "Clinical team actively assessing protocol criteria" },
  action_needed: { label: "Action Needed", className: "bg-amber-50 text-amber-800 border-amber-300", desc: "Waiting for participant to finish requested task" },
  pre_screening: { label: "Pre-Screening", className: "bg-blue-50 text-blue-800 border-blue-200", desc: "Undergoing phone/remote screener verification" },
  eligible_next_step: { label: "Eligible for Next Step", className: "bg-emerald-50 text-emerald-800 border-emerald-300", desc: "Candidate qualified for baseline visit" },
  enrolled: { label: "Enrolled", className: "bg-purple-50 text-purple-800 border-purple-200", desc: "Consented and active in study protocol" },
  completed: { label: "Completed", className: "bg-teal-50 text-teal-800 border-teal-200", desc: "Protocol visits completed and stipend disbursed" },
  not_selected: { label: "Not Selected", className: "bg-rose-50 text-rose-800 border-rose-200", desc: "Did not meet inclusion criteria or cohort filled" },
  withdrawn: { label: "Withdrawn", className: "bg-slate-100 text-slate-700 border-slate-300", desc: "Participant voluntarily withdrew application" },
  study_closed: { label: "Study Closed", className: "bg-gray-100 text-gray-600 border-gray-300", desc: "Recruitment closed for this protocol" },
  // Legacy aliases
  screener_passed: { label: "Qualified", className: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "Screener criteria passed" },
  pending_contact: { label: "Needs Outreach", className: "bg-amber-50 text-amber-800 border-amber-200", desc: "Coordinator outreach required" },
  scheduled: { label: "Visit Scheduled", className: "bg-sky-50 text-sky-700 border-sky-200", desc: "Initial visit booked" },
  screened_out: { label: "Screened Out", className: "bg-slate-100 text-slate-600 border-slate-200", desc: "Exclusion criteria met" },
};

const DEMO_COORDINATORS = [
  { id: 203, name: "Sarah Lindquist, CRC", role: "Lead Study Coordinator" },
  { id: 201, name: "Dr. Helen Whitman, MD", role: "Principal Investigator" },
  { id: 204, name: "Marcus Vance, CRC", role: "Clinical Research Coordinator" },
];

export default function ResearcherPortal() {
  const [activeView, setActiveView] = useState<"overview" | "pipeline" | "criteria">("overview");
  const [selectedStudyId, setSelectedStudyId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [applicantSearch, setApplicantSearch] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [studyToEdit, setStudyToEdit] = useState<any | null>(null);
  const [activePI, setActivePI] = useState<{
    id: string;
    name: string;
    title: string;
    institution: string;
    studySlug: string;
    studyTitle: string;
  } | null>(null);

  // Selected applicant for detail/status/task management drawer
  const [selectedApplicant, setSelectedApplicant] = useState<any | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  // Form states for status update
  const [newStatus, setNewStatus] = useState<string>("");
  const [participantNote, setParticipantNote] = useState<string>("");
  const [internalNote, setInternalNote] = useState<string>("");
  const [selectedCoordId, setSelectedCoordId] = useState<string>("");

  // Form states for creating a task
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskType, setTaskType] = useState<any>("confirm_availability");
  const [taskDaysDue, setTaskDaysDue] = useState("3");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("studyloop_active_pi");
      if (stored) {
        setActivePI(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const isPI = Boolean(activePI && activePI.studySlug !== "all");

  const { data, isLoading, refetch } = trpc.researcher.dashboardOverview.useQuery({
    studyId: selectedStudyId !== "all" ? Number(selectedStudyId) : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: applicantSearch || undefined,
  });

  const updateStatusMutation = trpc.researcher.updateStatusWithHistory.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Application status updated with audit log!", {
        description: "Participant has been notified with the public explanation."
      });
      setSelectedApplicant(null);
    },
    onError: (err) => {
      toast.error("Failed to update status: " + err.message);
    }
  });

  const createTaskMutation = trpc.researcher.createTask.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Participant task created!", {
        description: "Task is now active in the participant's My Studies dashboard."
      });
      setTaskModalOpen(false);
      setTaskTitle("");
      setTaskDesc("");
    },
    onError: (err) => {
      toast.error("Failed to create task: " + err.message);
    }
  });

  const closeRecruitmentMutation = trpc.researcher.closeRecruitment.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Study recruitment closed", {
        description: "New applications paused and enrolled cohort preserved."
      });
    },
    onError: (err) => {
      toast.error("Failed to close recruitment: " + err.message);
    }
  });

  const currentPIStudy = useMemo(() => {
    if (!data?.studies) return null;
    if (activePI && activePI.studySlug !== "all") {
      const found = data.studies.find((s) => s.slug === activePI.studySlug);
      if (found) return found;
    }
    return data.studies[0] || null;
  }, [data?.studies, activePI]);

  // Auto-scope selected study if active PI has an assigned study
  useEffect(() => {
    if (activePI) {
      if (activePI.studySlug === "all") {
        setSelectedStudyId("all");
      } else if (data?.studies) {
        const matched = data.studies.find((s) => s.slug === activePI.studySlug);
        if (matched) {
          setSelectedStudyId(matched.id.toString());
        }
      }
    }
  }, [activePI, data?.studies]);

  const openApplicantDrawer = (item: any) => {
    setSelectedApplicant(item);
    setNewStatus(item.application.status);
    setParticipantNote(item.application.participantFacingNote || "");
    setInternalNote(item.application.internalStaffNote || "");
    setSelectedCoordId(item.application.assignedCoordinatorId ? String(item.application.assignedCoordinatorId) : "203");
  };

  const handleStatusSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicant) return;

    const coord = DEMO_COORDINATORS.find(c => String(c.id) === selectedCoordId);

    updateStatusMutation.mutate({
      applicationId: selectedApplicant.application.id,
      status: newStatus,
      participantFacingNote: participantNote || undefined,
      internalStaffNote: internalNote || undefined,
      assignedCoordinatorId: coord?.id,
      assignedCoordinatorName: coord?.name,
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplicant || !taskTitle || !taskDesc) {
      toast.error("Please provide a task title and instructions.");
      return;
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + Number(taskDaysDue));

    createTaskMutation.mutate({
      profileKey: selectedApplicant.profile.profileKey,
      applicationId: selectedApplicant.application.id,
      title: taskTitle,
      description: taskDesc,
      taskType,
      dueDate,
      actionUrl: "/my-studies",
    });
  };

  const handleStudyCreatedOrUpdated = (createdOrUpdated?: any) => {
    refetch();
    if (createdOrUpdated && isPI && activePI) {
      const updatedPI = {
        ...activePI,
        studySlug: createdOrUpdated.slug || activePI.studySlug,
        studyTitle: createdOrUpdated.title || activePI.studyTitle,
      };
      setActivePI(updatedPI);
      try {
        localStorage.setItem("studyloop_active_pi", JSON.stringify(updatedPI));
      } catch {}
    }
  };

  const exportCohortCSV = () => {
    if (!data?.pipeline || data.pipeline.length === 0) {
      toast.error("No applicant records to export.");
      return;
    }

    const headers = ["Application ID", "Participant Name", "Email", "Phone", "Age", "Gender", "Living Environment", "City", "State", "Study Title", "Status", "Screener Score", "Date Applied"];
    const rows = data.pipeline.map(({ application, profile, study }) => [
      application.id,
      `"${profile.fullName}"`,
      profile.email,
      profile.phone || "N/A",
      profile.age,
      profile.gender,
      profile.livingEnvironment,
      profile.city,
      profile.state,
      `"${study.title}"`,
      application.status,
      `${application.qualificationScore}%`,
      new Date(application.createdAt).toISOString().split("T")[0]
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `studyloop_qualified_cohort_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Cohort CSV exported successfully for IRB reporting.");
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-[75vh] bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500 text-sm">
          <Loader2 className="h-7 w-7 text-sky-600 animate-spin" />
          Loading the participant lifecycle pipeline...
        </div>
      </div>
    );
  }

  const maleTotal = data.diversity.genderBreakdown.male;
  const femaleTotal = data.diversity.genderBreakdown.female;
  const genderTotal = Math.max(1, maleTotal + femaleTotal + data.diversity.genderBreakdown.other);
  const malePct = Math.round((maleTotal / genderTotal) * 100);
  const ruralTotal = data.diversity.locationBreakdown.rural;
  const geoTotal = Math.max(1, Object.values(data.diversity.locationBreakdown).reduce((a, b) => a + b, 0));
  const ruralPct = Math.round((ruralTotal / geoTotal) * 100);

  const filteredPipeline = data.pipeline.filter((item) => {
    if (applicantSearch) {
      const q = applicantSearch.toLowerCase();
      const matchName = item.profile.fullName.toLowerCase().includes(q);
      const matchCity = item.profile.city.toLowerCase().includes(q);
      const matchStudy = item.study.title.toLowerCase().includes(q);
      if (!matchName && !matchCity && !matchStudy) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      {/* Top Banner */}
      <div className="bg-slate-950 text-slate-100 border-b border-slate-800">
        <div className="container h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-slate-300 font-semibold">Triangle Research Network</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">IRB-Compliant Participant Lifecycle Platform</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {data.stats.overdueCount > 0 && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {data.stats.overdueCount} application{data.stats.overdueCount === 1 ? "" : "s"} &gt; 48h SLA
              </span>
            )}
            <button onClick={exportCohortCSV} className="text-slate-300 hover:text-white flex items-center gap-1">
              <Download className="h-3.5 w-3.5 text-sky-400" /> Export CSV
            </button>
            <Link href="/my-studies" className="text-slate-300 hover:text-white flex items-center gap-1.5">
              <ArrowUpRight className="h-3.5 w-3.5" /> Participant View
            </Link>
          </div>
        </div>
      </div>

      <div className="container py-5 lg:py-7">
        <div className="grid grid-cols-1 lg:grid-cols-[215px_1fr] gap-5 lg:gap-7">
          {/* Desktop sidebar */}
          <aside className="hidden lg:flex flex-col gap-4">
            <div className="rounded-xl bg-white border border-slate-200 shadow-xs p-4">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="h-9 w-9 rounded-lg bg-sky-600 text-white flex items-center justify-center shadow-sm">
                  <Building2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Organization</p>
                  <p className="text-xs font-bold text-slate-900">Triangle Research Network</p>
                </div>
              </div>
              <nav className="space-y-1">
                <SidebarNav active={activeView === "overview"} icon={<LayoutDashboard className="h-4 w-4" />} label="Overview" onClick={() => setActiveView("overview")} />
                <SidebarNav active={activeView === "pipeline"} icon={<UsersRound className="h-4 w-4" />} label="Participant Pipeline" badge={data.stats.totalApplicants} onClick={() => setActiveView("pipeline")} />
                <SidebarNav active={activeView === "criteria"} icon={<SlidersHorizontal className="h-4 w-4" />} label="Study Criteria" onClick={() => setActiveView("criteria")} />
                <SidebarNav active={false} icon={<Download className="h-4 w-4" />} label="Export Cohort" onClick={exportCohortCSV} />
              </nav>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-4 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="h-4 w-4" />
                <span>Zero-Spreadsheet Pipeline</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Participants see transparent status updates and tasks. Internal research notes stay strictly confidential.
              </p>
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex justify-between">
                <span>Pass Rate</span>
                <span className="font-bold text-white">{data.stats.efficiencyRate}%</span>
              </div>
            </div>
          </aside>

          {/* Main Workspace */}
          <main className="min-w-0 space-y-5">
            {activePI && (
              <div className="rounded-xl bg-gradient-to-r from-slate-900 via-slate-950 to-sky-950 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-sky-900 shadow-md">
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0">
                    <Activity className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-base font-extrabold">{activePI.name}</span>
                      <Badge className="bg-sky-500 text-white text-[10px] font-bold">
                        PRINCIPAL INVESTIGATOR
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {activePI.institution} • Assigned Protocol: <span className="text-white font-semibold">{activePI.studyTitle}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setStudyToEdit(currentPIStudy);
                      setCreateModalOpen(true);
                    }}
                    size="sm"
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs h-8 font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Settings2 className="h-3.5 w-3.5" /> Manage Study
                  </Button>
                  <Link href="/institution/login">
                    <Button variant="outline" size="sm" className="bg-white/10 hover:bg-white/20 border-white/20 text-white text-xs h-8">
                      Switch PI
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-sky-700 uppercase tracking-wider">
                  <BadgeCheck className="h-3.5 w-3.5" /> StudyLoop Participant Lifecycle Platform
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-1">
                  Participant Pipeline & Status Management
                </h1>
                <p className="text-sm text-slate-600 mt-1.5">
                  Manage candidates through normalized lifecycle stages, assign coordinators, and request participant actions with SLA oversight.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={exportCohortCSV} variant="outline" className="h-9 text-xs font-semibold rounded-lg flex items-center gap-1.5">
                  <Download className="h-4 w-4 text-slate-500" /> Export CSV
                </Button>
                <Button
                  onClick={() => {
                    setStudyToEdit(null);
                    setCreateModalOpen(true);
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white h-9 text-xs font-bold rounded-lg flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="h-4 w-4" /> Create Study
                </Button>
              </div>
            </div>

            {/* SLA Alert if any applications > 48 hours without review */}
            {data.stats.overdueCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-3 text-xs text-amber-900">
                <div className="flex items-center gap-2.5">
                  <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold">Review SLA Warning: </span>
                    <span>
                      {data.stats.overdueCount} application{data.stats.overdueCount === 1 ? " has" : "s have"} been waiting longer than 48 hours for coordinator review.
                    </span>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setActiveView("pipeline");
                    setStatusFilter("submitted");
                  }}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7 shrink-0"
                >
                  Review Overdue Queue
                </Button>
              </div>
            )}

            {/* Mobile Subnav */}
            <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-1 flex overflow-x-auto">
              <MobileTab active={activeView === "overview"} onClick={() => setActiveView("overview")} label="Overview" />
              <MobileTab active={activeView === "pipeline"} onClick={() => setActiveView("pipeline")} label={`Pipeline (${data.stats.totalApplicants})`} />
              <MobileTab active={activeView === "criteria"} onClick={() => setActiveView("criteria")} label="Criteria" />
            </div>

            {/* Overview View */}
            {activeView === "overview" && (
              <>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  <MetricCard icon={<Users className="h-4 w-4" />} accent="sky" value={data.stats.totalApplicants} label="Total Pipeline" change="All applicants across active studies" />
                  <MetricCard icon={<UserRoundCheck className="h-4 w-4" />} accent="emerald" value={data.stats.qualifiedApplicants} label="Qualified / Enrolled" change={`${data.stats.efficiencyRate}% pass rate`} />
                  <MetricCard icon={<Clock className="h-4 w-4" />} accent="amber" value={data.stats.overdueCount} label="SLA Pending (>48h)" change="Requires coordinator action" />
                  <MetricCard icon={<CircleDollarSign className="h-4 w-4" />} accent="purple" value={`$${data.studies.reduce((sum, s) => sum + s.compensationAmount, 0).toLocaleString()}`} label="Participant Budget" change="Compensation visible upfront" />
                </div>

                {/* Pipeline Pulse */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                  <section className="xl:col-span-3 rounded-xl bg-white border border-slate-200 shadow-xs p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          {isPI ? "Your Protocol Recruitment Status" : "Active study recruitment pulse"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Enrollment quotas and lifecycle capacity.</p>
                      </div>
                      <Button
                        onClick={() => {
                          setStudyToEdit(currentPIStudy);
                          setCreateModalOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-semibold"
                      >
                        Manage Quotas
                      </Button>
                    </div>
                    <div className="mt-5 space-y-4">
                      {(isPI && currentPIStudy ? [currentPIStudy] : data.studies).map((study) => {
                        const pct = Math.round((study.currentEnrolled / study.targetEnrollment) * 100);
                        const isClosed = study.status === "closed";
                        return (
                          <div key={study.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 pb-3 border-b border-slate-100 last:border-0">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-800 truncate">{study.title}</span>
                                {study.isSponsored && <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-amber-700 bg-amber-50 border-amber-200">SPONSORED</Badge>}
                                {isClosed && <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-slate-100 text-slate-600">RECRUITMENT CLOSED</Badge>}
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
                                <div className={`h-full rounded-full ${pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-sky-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <div className="text-right whitespace-nowrap flex items-center gap-3">
                              <div>
                                <p className="text-xs font-bold text-slate-800">{study.currentEnrolled}/{study.targetEnrollment}</p>
                                <p className="text-[10px] text-slate-400">${study.compensationAmount} stipend</p>
                              </div>
                              {!isClosed && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => closeRecruitmentMutation.mutate({ studyId: study.id })}
                                  disabled={closeRecruitmentMutation.isPending}
                                  className="h-7 text-[10px] text-slate-500 hover:text-red-600 hover:bg-red-50"
                                  title="Close recruitment for this study"
                                >
                                  Close
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="xl:col-span-2 rounded-xl bg-white border border-slate-200 shadow-xs p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Demographic Representation</h2>
                        <p className="text-xs text-slate-500 mt-1">Cohort diversity balance</p>
                      </div>
                      <BarChart3 className="h-5 w-5 text-sky-600" />
                    </div>

                    <div className="mt-5 space-y-5">
                      <MiniBar label="Male" value={malePct} valueLabel={`${maleTotal} profile${maleTotal === 1 ? "" : "s"}`} color="bg-sky-500" />
                      <MiniBar label="Female" value={Math.round((femaleTotal / genderTotal) * 100)} valueLabel={`${femaleTotal} profile${femaleTotal === 1 ? "" : "s"}`} color="bg-purple-500" />
                      <MiniBar label="Rural / non-metro" value={ruralPct} valueLabel={`${ruralTotal} profile${ruralTotal === 1 ? "" : "s"}`} color="bg-teal-500" />
                    </div>
                  </section>
                </div>

                <section className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-5 flex items-center justify-between border-b border-slate-100">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Recent Applications Requiring Review</h2>
                      <p className="text-xs text-slate-500 mt-1">Click any candidate to update status, add private notes, or assign a coordinator.</p>
                    </div>
                    <Button onClick={() => setActiveView("pipeline")} variant="ghost" size="sm" className="text-xs text-sky-700 hover:text-sky-800">
                      Open Full Pipeline <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {data.pipeline.slice(0, 4).map((item) => (
                      <ApplicantRow 
                        key={item.application.id} 
                        item={item} 
                        onOpen={() => openApplicantDrawer(item)} 
                      />
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Pipeline View */}
            {activeView === "pipeline" && (
              <section className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">Participant Pipeline Management</h2>
                      <p className="text-xs text-slate-500 mt-1">Search, filter by lifecycle status, and manage coordinator handoffs.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={exportCohortCSV} variant="outline" size="sm" className="text-xs h-8">
                        <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5">
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <Input value={applicantSearch} onChange={(e) => setApplicantSearch(e.target.value)} placeholder="Search name, city, or condition" className="h-8 pl-8 text-xs" />
                    </div>
                    {isPI ? (
                      <div className="h-8 px-2.5 rounded-md bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between gap-1 min-w-0">
                        <span className="truncate">{currentPIStudy?.title || activePI?.studyTitle}</span>
                        <Badge className="bg-sky-100 text-sky-800 text-[10px] py-0 px-1 font-bold shrink-0">1 Study Locked</Badge>
                      </div>
                    ) : (
                      <Select value={selectedStudyId} onValueChange={setSelectedStudyId}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All active studies" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All active studies</SelectItem>
                          {data.studies.map((study) => <SelectItem key={study.id} value={study.id.toString()}>{study.title}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All lifecycle statuses" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All lifecycle statuses</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="action_needed">Action Needed</SelectItem>
                        <SelectItem value="eligible_next_step">Eligible for Next Step</SelectItem>
                        <SelectItem value="enrolled">Enrolled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="not_selected">Not Selected</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="hidden md:grid grid-cols-[1.2fr_1.4fr_1fr_1.1fr_120px] gap-4 bg-slate-50 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Participant profile</span>
                  <span>Protocol</span>
                  <span>Representation</span>
                  <span>Lifecycle Status</span>
                  <span className="text-right">Actions</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredPipeline.length > 0 ? (
                    filteredPipeline.map((item) => (
                      <ApplicantRow 
                        key={item.application.id} 
                        item={item} 
                        onOpen={() => openApplicantDrawer(item)} 
                        detailed 
                      />
                    ))
                  ) : (
                    <div className="p-12 text-center text-sm text-slate-500">No applicants match these filters.</div>
                  )}
                </div>
              </section>
            )}

            {/* Criteria View */}
            {activeView === "criteria" && (
              <section className="space-y-5">
                <div className="rounded-xl bg-white border border-slate-200 shadow-xs p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-slate-900">Study criteria & dynamic screener</h2>
                      <p className="text-xs text-slate-500 mt-1">Configure transparent criteria and study questions to automate site handoff.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setStudyToEdit(null);
                          setCreateModalOpen(true);
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 font-bold"
                      >
                        <Plus className="h-4 w-4 mr-1" /> New Protocol
                      </Button>
                      {isPI ? (
                        <Button
                          onClick={() => {
                            setStudyToEdit(currentPIStudy);
                            setCreateModalOpen(true);
                          }}
                          className="bg-sky-600 hover:bg-sky-500 text-white text-xs h-9 font-bold flex items-center gap-1.5"
                        >
                          <Settings2 className="h-3.5 w-3.5" /> Manage This Protocol
                        </Button>
                      ) : (
                        <Select value={selectedStudyId} onValueChange={setSelectedStudyId}>
                          <SelectTrigger className="w-[200px] h-9 text-xs"><SelectValue placeholder="Select a study" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All active protocols</SelectItem>
                            {data.studies.map((study) => <SelectItem key={study.id} value={study.id.toString()}>{study.title}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                </div>

                {(isPI && currentPIStudy ? [currentPIStudy] : (selectedStudyId === "all" ? data.studies : data.studies.filter(s => s.id === Number(selectedStudyId)))).map((study) => (
                  <div key={study.id} className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-[10px] bg-sky-50 border-sky-200 text-sky-700">Active & Recruiting</Badge>
                          {isPI && <Badge className="bg-emerald-600 text-white text-[10px] font-bold">YOUR ASSIGNED PROTOCOL</Badge>}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-2">{study.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">{study.sponsorName} • Target: {study.targetEnrollment} participants ({study.currentEnrolled || 0} enrolled)</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-base font-extrabold text-emerald-700">${study.compensationAmount}</span>
                          <p className="text-[11px] text-slate-400">{study.compensationSchedule || study.compensationType}</p>
                        </div>
                        <Button
                          onClick={() => {
                            setStudyToEdit(study);
                            setCreateModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Settings2 className="h-3.5 w-3.5 text-slate-500" /> Edit Protocol
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-slate-100">
                      <CriteriaCell icon={<Users className="h-4 w-4" />} title="Core eligibility" body={`Ages ${study.minAge}–${study.maxAge} • ${study.targetGender === "all" ? "All genders" : `${study.targetGender} prioritization`} • ${study.healthyVolunteersAccepted ? "Healthy volunteers welcome" : "Condition-based"}`} />
                      <CriteriaCell icon={<Target className="h-4 w-4" />} title="Representation focus" body={study.targetDemographicFocus || "Balanced representation across communities"} />
                      <CriteriaCell icon={<ClipboardCheck className="h-4 w-4" />} title="Dynamic screen" body="Pre-screeners filter out exclusion criteria before a patient reaches your dashboard." />
                    </div>
                  </div>
                ))}
              </section>
            )}
          </main>
        </div>
      </div>

      {/* APPLICANT REVIEW & LIFECYCLE DRAWER / DIALOG */}
      {selectedApplicant && (
        <Dialog open={Boolean(selectedApplicant)} onOpenChange={(open) => !open && setSelectedApplicant(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 pr-6">
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    {selectedApplicant.profile.fullName}
                    {selectedApplicant.isOverdueReview && (
                      <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-[10px]">
                        Overdue Review (&gt;48h)
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Applied to {selectedApplicant.study.title} • Score: {selectedApplicant.application.qualificationScore}%
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Tabs defaultValue="status" className="mt-2">
              <TabsList className="grid grid-cols-3 h-8 text-xs">
                <TabsTrigger value="status">Status & Notes</TabsTrigger>
                <TabsTrigger value="profile">Applicant Summary</TabsTrigger>
                <TabsTrigger value="tasks">Tasks & Actions</TabsTrigger>
              </TabsList>

              {/* TAB 1: STATUS & AUDIT NOTES */}
              <TabsContent value="status" className="space-y-4 pt-3">
                <form onSubmit={handleStatusSubmit} className="space-y-4">
                  {/* Status selection */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-800">Lifecycle Status *</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="submitted">Submitted (In queue)</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="action_needed">Action Needed (Participant task pending)</SelectItem>
                        <SelectItem value="pre_screening">Pre-screening (Outreach call)</SelectItem>
                        <SelectItem value="eligible_next_step">Eligible for Next Step (Schedule clinic visit)</SelectItem>
                        <SelectItem value="enrolled">Enrolled in Study</SelectItem>
                        <SelectItem value="completed">Completed Protocol</SelectItem>
                        <SelectItem value="not_selected">Not Selected (Respectful notice)</SelectItem>
                        <SelectItem value="withdrawn">Withdrawn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Coordinator Assignment */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-800">Assigned Coordinator *</Label>
                    <Select value={selectedCoordId} onValueChange={setSelectedCoordId}>
                      <SelectTrigger className="text-xs h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEMO_COORDINATORS.map((coord) => (
                          <SelectItem key={coord.id} value={String(coord.id)}>
                            {coord.name} ({coord.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dual Note Fields: Participant-Facing vs Internal Note */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 text-sky-600" />
                      <Label className="text-xs font-bold text-slate-800">
                        Participant-Facing Explanation (Visible to Participant)
                      </Label>
                    </div>
                    <Textarea 
                      placeholder="e.g. Welcome! Coordinator Sarah has reviewed your pre-screener and will call you on Wednesday for the initial 15-minute phone intake."
                      value={participantNote}
                      onChange={(e) => setParticipantNote(e.target.value)}
                      className="text-xs min-h-[70px]"
                    />
                    <p className="text-[10px] text-slate-400">
                      This note will appear directly in the participant's "My Studies" dashboard under "What happens next?".
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                      <Label className="text-xs font-bold text-slate-800">
                        Internal Staff Note (Strictly Private to Research Team)
                      </Label>
                    </div>
                    <Textarea 
                      placeholder="e.g. High priority rural cohort match. Baseline HbA1c required. Cross-referenced with Exclusion List."
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      className="text-xs min-h-[70px] bg-amber-50/40 border-amber-200"
                    />
                    <p className="text-[10px] text-amber-700/80">
                      Confidential. Never displayed to the participant.
                    </p>
                  </div>

                  {/* Audit History Log */}
                  {selectedApplicant.history && selectedApplicant.history.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-[11px] font-bold text-slate-700 mb-2">Status Audit Trail</p>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px] text-slate-600">
                        {selectedApplicant.history.map((h: any, idx: number) => (
                          <div key={idx} className="p-2 bg-slate-50 rounded-md border border-slate-100 flex items-start justify-between gap-2">
                            <div>
                              <span className="font-semibold text-slate-800">{h.changedByName || "Study Team"}: </span>
                              <span>{h.fromStatus ? `${h.fromStatus} → ` : ""}{h.toStatus}</span>
                              {h.participantFacingNote && (
                                <p className="text-[10px] text-slate-500 italic mt-0.5">"{h.participantFacingNote}"</p>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(h.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedApplicant(null)}
                      className="text-xs h-8"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      size="sm" 
                      disabled={updateStatusMutation.isPending}
                      className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-8 font-semibold"
                    >
                      {updateStatusMutation.isPending ? "Saving..." : "Save Status & Notify Participant"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* TAB 2: APPLICANT SUMMARY */}
              <TabsContent value="profile" className="space-y-4 pt-3 text-xs">
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Contact Email</span>
                    <p className="font-medium text-slate-900">{selectedApplicant.profile.email}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Mobile Phone</span>
                    <p className="font-medium text-slate-900">{selectedApplicant.profile.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Location</span>
                    <p className="font-medium text-slate-900">{selectedApplicant.profile.city}, {selectedApplicant.profile.state} ({selectedApplicant.profile.livingEnvironment})</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Age & Gender</span>
                    <p className="font-medium text-slate-900">Age {selectedApplicant.profile.age} • {selectedApplicant.profile.gender}</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Logistics & Commute</span>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <p>Transportation: <strong className="capitalize">{selectedApplicant.profile.transportationAccess || "personal_vehicle"}</strong></p>
                    <p>Travel Radius: <strong>{selectedApplicant.profile.travelDistanceMiles} miles</strong></p>
                    <p>Preferred Format: <strong className="capitalize">{selectedApplicant.profile.preferredLocationType || "Any"}</strong></p>
                    <p>Language: <strong>{selectedApplicant.profile.preferredLanguage || "English"}</strong></p>
                  </div>
                </div>

                {selectedApplicant.profile.conditions && selectedApplicant.profile.conditions.length > 0 && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Disclosed Conditions</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedApplicant.profile.conditions.map((c: string) => (
                        <Badge key={c} variant="outline" className="text-[10px] bg-white">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* TAB 3: TASKS & ACTIONS */}
              <TabsContent value="tasks" className="space-y-4 pt-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">Participant Action Requests</h4>
                    <p className="text-[11px] text-slate-500">Assign structured tasks for the participant to complete in My Studies.</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => setTaskModalOpen(true)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-7"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> Request Action
                  </Button>
                </div>

                {/* Existing tasks */}
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedApplicant.tasks && selectedApplicant.tasks.length > 0 ? (
                    selectedApplicant.tasks.map((task: any) => (
                      <div key={task.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{task.title}</span>
                            <Badge variant="outline" className={`text-[9px] py-0 px-1 ${
                              task.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {task.status}
                            </Badge>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5">{task.description}</p>
                          {task.completedAt && (
                            <p className="text-[10px] text-emerald-700 font-medium mt-1 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Completed on {new Date(task.completedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400">
                      No active tasks requested for this applicant yet.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* CREATE TASK MODAL */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Request Participant Action
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Assign a structured step for {selectedApplicant?.profile?.fullName} in My Studies.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Task Type</Label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirm_availability">Confirm Availability Schedule</SelectItem>
                  <SelectItem value="confirm_contact">Confirm Phone or Email</SelectItem>
                  <SelectItem value="complete_profile">Complete Profile Information</SelectItem>
                  <SelectItem value="finish_screener">Finish Pre-screener Questions</SelectItem>
                  <SelectItem value="review_study_details">Review Visit Protocol Details</SelectItem>
                  <SelectItem value="contact_support">Contact Coordinator Support</SelectItem>
                  <SelectItem value="custom_request">Custom Request</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Task Title *</Label>
              <Input 
                required
                placeholder="e.g. Confirm your availability for phone screening"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="text-xs h-8"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Instructions for Participant *</Label>
              <Textarea 
                required
                placeholder="e.g. Please select whether Tuesday or Thursday morning works best for a 15-minute introductory call."
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                className="text-xs min-h-[60px]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Due In (Days)</Label>
              <Select value={taskDaysDue} onValueChange={setTaskDaysDue}>
                <SelectTrigger className="text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Days (Urgent)</SelectItem>
                  <SelectItem value="3">3 Days (Standard)</SelectItem>
                  <SelectItem value="7">7 Days (Flexible)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setTaskModalOpen(false)} className="text-xs h-8">
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                disabled={createTaskMutation.isPending}
                className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-8 font-semibold"
              >
                {createTaskMutation.isPending ? "Assigning..." : "Assign Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Protocol Creator & Management Modal */}
      <CreateStudyModal
        isOpen={createModalOpen}
        studyToEdit={studyToEdit}
        defaultPiName={activePI?.name}
        onClose={() => {
          setCreateModalOpen(false);
          setStudyToEdit(null);
        }}
        onCreated={handleStudyCreatedOrUpdated}
      />
    </div>
  );
}

function SidebarNav({ active, icon, label, badge, onClick }: { active: boolean; icon: React.ReactNode; label: string; badge?: number; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${active ? "bg-sky-50 text-sky-700 font-bold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}>
      {icon}<span>{label}</span>{badge !== undefined && <span className={`ml-auto rounded-md px-1.5 py-0.5 text-[10px] font-bold ${active ? "bg-sky-100" : "bg-slate-100 text-slate-500"}`}>{badge}</span>}
    </button>
  );
}

function MobileTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button onClick={onClick} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${active ? "bg-sky-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>{label}</button>;
}

function MetricCard({ icon, accent, value, label, change }: { icon: React.ReactNode; accent: "sky" | "emerald" | "amber" | "purple"; value: string | number; label: string; change: string }) {
  const styles = { sky: "bg-sky-50 text-sky-600", emerald: "bg-emerald-50 text-emerald-600", amber: "bg-amber-50 text-amber-600", purple: "bg-purple-50 text-purple-600" };
  return <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-xs"><div className="flex items-start justify-between"><div><p className="text-xl sm:text-2xl font-extrabold text-slate-950">{value}</p><p className="text-xs font-semibold text-slate-700 mt-0.5">{label}</p></div><div className={`h-8 w-8 rounded-lg flex items-center justify-center ${styles[accent]}`}>{icon}</div></div><p className="text-[10px] text-slate-400 mt-3 truncate">{change}</p></div>;
}

function MiniBar({ label, value, valueLabel, color }: { label: string; value: number; valueLabel: string; color: string }) {
  return <div><div className="flex justify-between text-xs mb-1.5"><span className="font-semibold text-slate-700">{label}</span><span className="text-slate-500">{value}% <span className="text-slate-300">•</span> {valueLabel}</span></div><div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{ width: `${Math.max(value, 4)}%` }} /></div></div>;
}

function CriteriaCell({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="bg-white p-4"><div className="flex items-center gap-2 text-sky-600 text-xs font-bold">{icon}{title}</div><p className="text-xs text-slate-600 leading-relaxed mt-2">{body}</p></div>;
}

function ApplicantRow({ item, onOpen, detailed = false }: { item: any; onOpen: () => void; detailed?: boolean }) {
  const { profile, study, application, isOverdueReview } = item;
  const cfg = lifecycleStatusConfig[application.status] || lifecycleStatusConfig.submitted;

  return (
    <div 
      onClick={onOpen}
      className={`px-5 py-4 cursor-pointer hover:bg-slate-50/80 transition-colors ${
        detailed 
          ? "md:grid md:grid-cols-[1.2fr_1.4fr_1fr_1.1fr_120px] md:items-center md:gap-4" 
          : "flex flex-col sm:flex-row sm:items-center gap-3"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-100 to-indigo-100 text-sky-800 flex items-center justify-center text-xs font-extrabold shrink-0">
          {profile.fullName.split(" ").map((p: string) => p[0]).join("").slice(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-bold text-slate-900 truncate">{profile.fullName}</p>
            {isOverdueReview && (
              <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" title="Review overdue (>48h)" />
            )}
          </div>
          <p className="text-[11px] text-slate-500">Age {profile.age} • {profile.city}, {profile.state}</p>
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-800 truncate">{study.title}</p>
        <p className="text-[10px] text-slate-400 truncate">{study.sponsorName || "Study Team"}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-slate-50 text-slate-600 border-slate-200 capitalize">
          {profile.gender}
        </Badge>
        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-slate-50 text-slate-600 border-slate-200 capitalize">
          {profile.livingEnvironment}
        </Badge>
      </div>

      <div>
        <Badge variant="outline" className={`text-[10px] font-bold ${cfg.className}`}>
          {cfg.label}
        </Badge>
        <p className="text-[10px] text-slate-400 mt-1">
          {application.assignedCoordinatorName ? `Coord: ${application.assignedCoordinatorName.split(",")[0]}` : "Unassigned"}
        </p>
      </div>

      <div className={`${detailed ? "md:text-right" : "sm:ml-auto"}`}>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-7 text-[10px] font-semibold hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300"
        >
          Review & Actions
        </Button>
      </div>
    </div>
  );
}
