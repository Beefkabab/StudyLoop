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
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CreateStudyModal } from "@/components/CreateStudyModal";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  screener_passed: { label: "Qualified", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending_contact: { label: "Needs Outreach", className: "bg-amber-50 text-amber-800 border-amber-200" },
  scheduled: { label: "Visit Scheduled", className: "bg-sky-50 text-sky-700 border-sky-200" },
  enrolled: { label: "Enrolled", className: "bg-purple-50 text-purple-700 border-purple-200" },
  screened_out: { label: "Screened Out", className: "bg-slate-100 text-slate-600 border-slate-200" },
  completed: { label: "Completed", className: "bg-teal-50 text-teal-700 border-teal-200" },
  withdrawn: { label: "Withdrawn", className: "bg-red-50 text-red-600 border-red-200" },
};

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
      if (createdOrUpdated.id) {
        setSelectedStudyId(createdOrUpdated.id.toString());
      }
    }
  };

  const updateApplicant = trpc.researcher.updateApplicant.useMutation({
    onSuccess: () => {
      toast.success("Applicant status updated");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const filteredPipeline = useMemo(() => {
    if (!data?.pipeline) return [];
    if (!applicantSearch.trim()) return data.pipeline;
    const search = applicantSearch.toLowerCase();
    return data.pipeline.filter((item) =>
      item.profile.fullName.toLowerCase().includes(search) ||
      item.profile.city.toLowerCase().includes(search) ||
      item.study.title.toLowerCase().includes(search)
    );
  }, [data?.pipeline, applicantSearch]);

  const moveToScheduling = (applicationId: number, name: string) => {
    updateApplicant.mutate({
      applicationId,
      status: "scheduled",
      researcherNotes: `StudyLoop demo: Scheduling invite sent to ${name}.`,
    });
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
          Loading the qualified applicant pipeline...
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

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      {/* Dedicated researcher top bar */}
      <div className="bg-slate-950 text-slate-100 border-b border-slate-800">
        <div className="container h-12 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-slate-300">Live Researcher Portal</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">IRB-compliant qualified candidate management</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button onClick={exportCohortCSV} className="text-slate-300 hover:text-white flex items-center gap-1">
              <Download className="h-3.5 w-3.5 text-sky-400" /> Export Cohort (CSV)
            </button>
            <Link href="/browse" className="text-slate-300 hover:text-white flex items-center gap-1.5">
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
                <SidebarNav active={activeView === "pipeline"} icon={<UsersRound className="h-4 w-4" />} label="Qualified Pipeline" badge={data.stats.qualifiedApplicants} onClick={() => setActiveView("pipeline")} />
                <SidebarNav active={activeView === "criteria"} icon={<SlidersHorizontal className="h-4 w-4" />} label="Study Criteria" onClick={() => setActiveView("criteria")} />
                <SidebarNav active={false} icon={<Download className="h-4 w-4" />} label="Export Cohort" onClick={exportCohortCSV} />
              </nav>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-sky-600 to-cyan-600 text-white p-4 shadow-sm">
              <Sparkles className="h-5 w-5 text-amber-200" />
              <p className="text-xs font-bold mt-3">Dynamic pre-screening is active</p>
              <p className="text-[11px] text-sky-100 leading-relaxed mt-1.5">
                Exclusion criteria filter unaligned volunteers before they land in your queue.
              </p>
              <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-[11px]">
                <span className="text-sky-100">Efficiency rate</span>
                <span className="font-bold">{data.stats.efficiencyRate}%</span>
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
                      {activePI.institution} • Protocol: <span className="text-white font-semibold">{activePI.studyTitle}</span>
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
                  {!isPI && selectedStudyId !== "all" && (
                    <Button
                      onClick={() => setSelectedStudyId("all")}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-sky-300 hover:text-white h-8"
                    >
                      View All Studies
                    </Button>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-sky-700 uppercase tracking-wider">
                  <BadgeCheck className="h-3.5 w-3.5" /> Researcher Operations Portal
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950 mt-1">
                  Recruitment without the blind spots.
                </h1>
                <p className="text-sm text-slate-600 mt-1.5">
                  A desktop-first control room for actionable candidate profiles, study criteria, and representation insights.
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

            {/* Mobile Subnav */}
            <div className="lg:hidden bg-white rounded-xl border border-slate-200 p-1 flex overflow-x-auto">
              <MobileTab active={activeView === "overview"} onClick={() => setActiveView("overview")} label="Overview" />
              <MobileTab active={activeView === "pipeline"} onClick={() => setActiveView("pipeline")} label={`Pipeline (${data.stats.qualifiedApplicants})`} />
              <MobileTab active={activeView === "criteria"} onClick={() => setActiveView("criteria")} label="Criteria" />
            </div>

            {/* Overview View */}
            {activeView === "overview" && (
              <>
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                  <MetricCard icon={<Users className="h-4 w-4" />} accent="sky" value={data.stats.totalApplicants} label="Applications" change="Live across all active studies" />
                  <MetricCard icon={<UserRoundCheck className="h-4 w-4" />} accent="emerald" value={data.stats.qualifiedApplicants} label="Qualified Profiles" change={`${data.stats.efficiencyRate}% screening pass rate`} />
                  <MetricCard icon={<MousePointerClick className="h-4 w-4" />} accent="amber" value={data.stats.screenedOutCount} label="Screened Out Early" change="Coordinator hours preserved" />
                  <MetricCard icon={<CircleDollarSign className="h-4 w-4" />} accent="purple" value={`$${data.studies.reduce((sum, s) => sum + s.compensationAmount, 0).toLocaleString()}`} label="Active Participant Pay" change="Full compensation visible upfront" />
                </div>

                {/* Primary recruiting insight banner */}
                <section className="rounded-xl bg-slate-950 text-white p-5 sm:p-6 overflow-hidden relative">
                  <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-500/25 via-transparent to-transparent" />
                  <div className="relative grid grid-cols-1 md:grid-cols-[1.4fr_1fr] gap-6 items-center">
                    <div>
                      <Badge className="bg-amber-400/15 text-amber-200 border-amber-300/20 hover:bg-amber-400/15 text-[10px]">Representation signal</Badge>
                      <h2 className="text-xl font-extrabold mt-3 leading-tight">Candidate matching is reaching the participants traditional outreach misses.</h2>
                      <p className="text-sm text-slate-300 leading-relaxed mt-2">
                        Use living environment, education, and gender balancing criteria to surface the right participants before you spend coordinator hours on cold calls.
                      </p>
                      <Button onClick={() => setActiveView("pipeline")} variant="outline" className="mt-4 bg-white/10 hover:bg-white/15 border-white/20 text-white hover:text-white text-xs h-8">
                        Review qualified pipeline <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <InsightStat label="Rural representation" value={`${ruralPct}%`} target="Priority target: 25%" accent="text-teal-300" />
                      <InsightStat label="Male participants" value={`${malePct}%`} target="Target: 40% balanced cohort" accent="text-sky-300" />
                    </div>
                  </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
                  <section className="xl:col-span-3 rounded-xl bg-white border border-slate-200 shadow-xs p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          {isPI ? "Your Protocol Enrollment Pulse" : "Active study recruitment pulse"}
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Enrollment progress and study participant value.</p>
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
                        Manage Study & Quotas
                      </Button>
                    </div>
                    <div className="mt-5 space-y-4">
                      {(isPI && currentPIStudy ? [currentPIStudy] : data.studies).map((study) => {
                        const pct = Math.round((study.currentEnrolled / study.targetEnrollment) * 100);
                        return (
                          <div key={study.id} className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-800 truncate">{study.title}</span>
                                {study.isSponsored && <Badge variant="outline" className="text-[9px] px-1.5 py-0 text-amber-700 bg-amber-50 border-amber-200">SPONSORED</Badge>}
                              </div>
                              <div className="h-1.5 rounded-full bg-slate-100 mt-2 overflow-hidden">
                                <div className={`h-full rounded-full ${pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-sky-500" : "bg-amber-500"}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                            <div className="text-right whitespace-nowrap">
                              <p className="text-xs font-bold text-slate-800">{study.currentEnrolled}/{study.targetEnrollment}</p>
                              <p className="text-[10px] text-slate-400">${study.compensationAmount} stipend</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  <section className="xl:col-span-2 rounded-xl bg-white border border-slate-200 shadow-xs p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-bold text-slate-900">Qualified cohort mix</h2>
                        <p className="text-xs text-slate-500 mt-1">At-a-glance diversity balance</p>
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
                      <h2 className="text-base font-bold text-slate-900">Newest qualified candidates</h2>
                      <p className="text-xs text-slate-500 mt-1">Profiles that passed dynamic pre-screening questions.</p>
                    </div>
                    <Button onClick={() => setActiveView("pipeline")} variant="ghost" size="sm" className="text-xs text-sky-700 hover:text-sky-800">
                      View all pipeline <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {data.pipeline.filter(item => item.application.status !== "screened_out").slice(0, 3).map((item) => (
                      <ApplicantRow key={item.application.id} item={item} onSchedule={moveToScheduling} pending={updateApplicant.isPending} />
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
                      <h2 className="text-lg font-extrabold text-slate-900">Qualified applicant pipeline</h2>
                      <p className="text-xs text-slate-500 mt-1">Only candidates who pass your study-specific pre-screen questions appear here.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={exportCohortCSV} variant="outline" size="sm" className="text-xs h-8">
                        <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
                      </Button>
                      <Button onClick={() => toast.success("Batch email outreach prepared for all qualified participants.")} variant="outline" size="sm" className="text-xs h-8">
                        <Send className="h-3.5 w-3.5 mr-1" /> Message Qualified
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5">
                    <div className="relative">
                      <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <Input value={applicantSearch} onChange={(e) => setApplicantSearch(e.target.value)} placeholder="Search name, city, or study" className="h-8 pl-8 text-xs" />
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
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="All statuses" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        <SelectItem value="screener_passed">Qualified</SelectItem>
                        <SelectItem value="pending_contact">Needs outreach</SelectItem>
                        <SelectItem value="scheduled">Visit scheduled</SelectItem>
                        <SelectItem value="screened_out">Screened out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="hidden md:grid grid-cols-[1.2fr_1.5fr_1fr_1fr_120px] gap-4 bg-slate-50 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <span>Participant profile</span><span>Applied to</span><span>Representation</span><span>Screen result</span><span className="text-right">Action</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {filteredPipeline.length > 0 ? (
                    filteredPipeline.map((item) => (
                      <ApplicantRow key={item.application.id} item={item} onSchedule={moveToScheduling} pending={updateApplicant.isPending} detailed />
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

function InsightStat({ label, value, target, accent }: { label: string; value: string; target: string; accent: string }) {
  return <div className="rounded-xl bg-white/8 border border-white/10 p-3.5"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-1 text-2xl font-extrabold ${accent}`}>{value}</p><p className="mt-1 text-[10px] text-slate-400">{target}</p></div>;
}

function MiniBar({ label, value, valueLabel, color }: { label: string; value: number; valueLabel: string; color: string }) {
  return <div><div className="flex justify-between text-xs mb-1.5"><span className="font-semibold text-slate-700">{label}</span><span className="text-slate-500">{value}% <span className="text-slate-300">•</span> {valueLabel}</span></div><div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{ width: `${Math.max(value, 4)}%` }} /></div></div>;
}

function CriteriaCell({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return <div className="bg-white p-4"><div className="flex items-center gap-2 text-sky-600 text-xs font-bold">{icon}{title}</div><p className="text-xs text-slate-600 leading-relaxed mt-2">{body}</p></div>;
}

function ApplicantRow({ item, onSchedule, pending, detailed = false }: { item: any; onSchedule: (id: number, name: string) => void; pending: boolean; detailed?: boolean }) {
  const { profile, study, application } = item;
  const cfg = statusConfig[application.status] || statusConfig.screener_passed;
  return (
    <div className={`px-5 py-4 ${detailed ? "md:grid md:grid-cols-[1.2fr_1.5fr_1fr_1fr_120px] md:items-center md:gap-4" : "flex flex-col sm:flex-row sm:items-center gap-3"}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-sky-100 to-teal-100 text-sky-800 flex items-center justify-center text-xs font-extrabold shrink-0">
          {profile.fullName.split(" ").map((p: string) => p[0]).join("").slice(0, 2)}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900 truncate">{profile.fullName}</p>
          <p className="text-[11px] text-slate-500">Age {profile.age} • {profile.city}, {profile.state}</p>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-700 truncate">{study.title}</p>
        <p className="text-[10px] text-slate-400">{study.sponsorName}</p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-slate-50 text-slate-600 border-slate-200 capitalize">{profile.gender}</Badge>
        <Badge variant="outline" className="text-[10px] py-0 px-1.5 bg-slate-50 text-slate-600 border-slate-200 capitalize">{profile.livingEnvironment}</Badge>
      </div>
      <div>
        <Badge variant="outline" className={`text-[10px] font-bold ${cfg.className}`}>{cfg.label}</Badge>
        <p className="text-[10px] text-slate-400 mt-1">{application.qualificationScore}% screener score</p>
      </div>
      <div className={`${detailed ? "md:text-right" : "sm:ml-auto"}`}>
        {application.status === "screener_passed" || application.status === "pending_contact" ? (
          <Button disabled={pending} onClick={() => onSchedule(application.id, profile.fullName)} size="sm" className="h-7 text-[10px] bg-slate-900 hover:bg-slate-800 text-white font-bold">
            Schedule Visit
          </Button>
        ) : (
          <Button onClick={() => toast.info(`Viewing details for candidate ${profile.fullName}`)} variant="outline" size="sm" className="h-7 text-[10px]">
            View Handoff
          </Button>
        )}
      </div>
    </div>
  );
}
