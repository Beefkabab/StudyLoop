import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Search,
  Filter,
  Users,
  Layers,
  BarChart3,
  Calendar,
  Lock,
  UserCheck,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminOperations() {
  const [selectedAuditTab, setSelectedAuditTab] = useState("studies");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.admin.overview.useQuery();
  const { data: auditLogs, isLoading: auditLoading, refetch: refetchLogs } = trpc.admin.auditLog.useQuery();
  const { data: allStudies, refetch: refetchStudies } = trpc.studies.list.useQuery({});

  const toggleStudyMutation = trpc.admin.toggleStudyStatus.useMutation({
    onSuccess: () => {
      refetchStudies();
      refetchStats();
      toast.success("Study recruitment status updated");
    },
    onError: (err) => {
      toast.error("Failed to update study status: " + err.message);
    }
  });

  const handleToggleStatus = (studyId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "recruiting" ? "closed" : "recruiting";
    toggleStudyMutation.mutate({ studyId, status: nextStatus as any });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8">
      <div className="container max-w-6xl space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
              <Link href="/" className="hover:text-sky-600">Home</Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">Internal Operations & Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
              <ShieldAlert className="h-7 w-7 text-indigo-600" />
              StudyLoop Operations & Audit Console
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Internal moderation, protocol review, immutable consent audit logs, and lifecycle funnel telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchStats();
                refetchLogs();
                refetchStudies();
                toast.info("Console data refreshed");
              }}
              className="text-xs h-8 flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5 text-slate-500" /> Refresh Data
            </Button>
            <Link href="/researchers">
              <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8">
                Researcher Workspace
              </Button>
            </Link>
          </div>
        </div>

        {/* Funnel & Ops KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="p-4 pb-1">
              <CardDescription className="text-[11px] font-semibold uppercase text-slate-500">
                Verified Studies
              </CardDescription>
              <CardTitle className="text-2xl font-black text-slate-900">
                {stats?.totalStudies || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-[11px] text-slate-500">
              Across {stats?.organizationsCount || 2} verified networks
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="p-4 pb-1">
              <CardDescription className="text-[11px] font-semibold uppercase text-slate-500">
                Total Pipeline
              </CardDescription>
              <CardTitle className="text-2xl font-black text-slate-900">
                {stats?.totalApplications || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-[11px] text-slate-500">
              Applications recorded across studies
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="p-4 pb-1">
              <CardDescription className="text-[11px] font-semibold uppercase text-slate-500">
                Active Enrolled
              </CardDescription>
              <CardTitle className="text-2xl font-black text-purple-700">
                {stats?.enrolledCount || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-[11px] text-slate-500">
              {stats?.conversionRate || 0}% application-to-enroll conversion
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="p-4 pb-1">
              <CardDescription className="text-[11px] font-semibold uppercase text-slate-500">
                Action Needed
              </CardDescription>
              <CardTitle className="text-2xl font-black text-amber-600">
                {stats?.actionNeededCount || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-[11px] text-slate-500">
              {stats?.taskCompletionRate || 100}% participant task resolution
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="p-4 pb-1">
              <CardDescription className="text-[11px] font-semibold uppercase text-slate-500">
                Completed Visits
              </CardDescription>
              <CardTitle className="text-2xl font-black text-emerald-700">
                {stats?.completedCount || 0}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 text-[11px] text-slate-500">
              Full protocol milestones achieved
            </CardContent>
          </Card>
        </div>

        {/* Admin Working Tabs */}
        <Tabs defaultValue="studies" className="space-y-4">
          <TabsList className="bg-white border border-slate-200 p-1 h-9 rounded-xl">
            <TabsTrigger value="studies" className="text-xs">
              Study Protocol Governance ({allStudies?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="statusHistory" className="text-xs">
              Status Change Audit ({auditLogs?.statusHistory?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="consents" className="text-xs">
              Consent Records ({auditLogs?.consents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="telemetry" className="text-xs">
              Product Analytics Stream ({auditLogs?.analyticsEvents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="moderation" className="text-xs">
              Support & Moderation
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: STUDY PROTOCOL GOVERNANCE */}
          <TabsContent value="studies" className="space-y-4">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Clinical Trial Protocol Publication & Recruitment Control
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Toggle active recruitment status or close filled studies to protect participant experience.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100/70 px-4 py-2.5 font-semibold text-slate-700 grid grid-cols-12 gap-2">
                    <span className="col-span-5">Protocol Title & Sponsor</span>
                    <span className="col-span-2">Enrollment</span>
                    <span className="col-span-2">Stipend</span>
                    <span className="col-span-2">Status</span>
                    <span className="col-span-1 text-right">Action</span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {allStudies?.map((study) => (
                      <div key={study.id} className="px-4 py-3 grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5 min-w-0">
                          <Link href={`/study/${study.slug}`} className="font-bold text-slate-900 hover:text-sky-600 truncate block">
                            {study.title}
                          </Link>
                          <p className="text-[11px] text-slate-500">{study.sponsorName} • {study.city}, {study.state}</p>
                        </div>
                        <div className="col-span-2 font-medium text-slate-700">
                          {study.currentEnrolled} / {study.targetEnrollment}
                        </div>
                        <div className="col-span-2 font-semibold text-emerald-700">
                          ${study.compensationAmount}
                        </div>
                        <div className="col-span-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] capitalize ${study.status === "recruiting"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                              }`}
                          >
                            {study.status}
                          </Badge>
                        </div>
                        <div className="col-span-1 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={toggleStudyMutation.isPending}
                            onClick={() => handleToggleStatus(study.id, study.status)}
                            className="h-7 text-[10px] font-semibold text-sky-600 hover:text-sky-800"
                          >
                            {study.status === "recruiting" ? "Close" : "Open"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: STATUS AUDIT LOG */}
          <TabsContent value="statusHistory" className="space-y-4">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900">
                  Immutable Application Lifecycle Status History
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Detailed audit trail tracking who changed what status, timestamps, and visible vs internal notes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100/70 px-4 py-2.5 font-semibold text-slate-700 grid grid-cols-12 gap-2">
                    <span className="col-span-2">Timestamp</span>
                    <span className="col-span-2">Changed By</span>
                    <span className="col-span-3">Transition</span>
                    <span className="col-span-3">Participant Note</span>
                    <span className="col-span-2">Staff Note</span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {auditLogs?.statusHistory?.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">No status transitions logged yet.</div>
                    ) : (
                      auditLogs?.statusHistory?.map((log: any) => (
                        <div key={log.id} className="px-4 py-3 grid grid-cols-12 gap-2 items-start text-[11px]">
                          <span className="col-span-2 text-slate-500">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                          <span className="col-span-2 font-semibold text-slate-800">
                            {log.changedByName || "Study Team"}
                          </span>
                          <div className="col-span-3 font-mono">
                            <span className="text-slate-400">{log.fromStatus || "new"}</span>
                            <span className="text-slate-600"> → </span>
                            <span className="font-bold text-slate-900">{log.toStatus}</span>
                          </div>
                          <p className="col-span-3 text-slate-700 italic">
                            {log.participantFacingNote || "—"}
                          </p>
                          <p className="col-span-2 text-amber-800 bg-amber-50 p-1 rounded font-mono text-[10px]">
                            {log.internalStaffNote || "—"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: CONSENT RECORDS AUDIT */}
          <TabsContent value="consents" className="space-y-4">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900">
                  Participant Consent & Notification Permissions Ledger
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Versioned legal agreements (Terms of Service, Privacy Policy, Research Matching) recorded per participant.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <div className="bg-slate-100/70 px-4 py-2.5 font-semibold text-slate-700 grid grid-cols-12 gap-2">
                    <span className="col-span-3">Profile Key</span>
                    <span className="col-span-3">Consent Type</span>
                    <span className="col-span-2">Policy Version</span>
                    <span className="col-span-2">Status</span>
                    <span className="col-span-2 text-right">Recorded Date</span>
                  </div>
                  <div className="divide-y divide-slate-100 bg-white">
                    {auditLogs?.consents?.map((c: any) => (
                      <div key={c.id} className="px-4 py-3 grid grid-cols-12 gap-2 items-center text-[11px]">
                        <span className="col-span-3 font-mono text-slate-600 truncate">{c.profileKey}</span>
                        <span className="col-span-3 font-semibold text-slate-800 capitalize">{c.consentType.replace(/_/g, " ")}</span>
                        <span className="col-span-2 font-mono text-slate-500">{c.version}</span>
                        <div className="col-span-2">
                          <Badge variant="outline" className={`text-[10px] ${c.isGranted ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-rose-50 text-rose-700 border-rose-300"}`}>
                            {c.isGranted ? "Granted" : "Revoked"}
                          </Badge>
                        </div>
                        <span className="col-span-2 text-right text-slate-400">
                          {new Date(c.grantedAt || c.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: TELEMETRY STREAM */}
          <TabsContent value="telemetry" className="space-y-4">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900">
                  Full-Funnel Lifecycle Analytics Stream
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Real-time event tracking across Discovery, Application, Participant Experience, Operations, and Outcomes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {auditLogs?.analyticsEvents?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">No analytics events streamed yet.</div>
                  ) : (
                    auditLogs?.analyticsEvents?.map((evt: any) => (
                      <div key={evt.id} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{evt.eventType}</span>
                              <Badge variant="secondary" className="text-[10px] uppercase font-mono py-0 px-1.5">
                                {evt.funnelStage}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Profile: {evt.profileKey || "anonymous"} {evt.studyId ? `• Study #${evt.studyId}` : ""} {evt.applicationId ? `• App #${evt.applicationId}` : ""}
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono shrink-0">
                          {new Date(evt.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 5: SUPPORT & MODERATION */}
          <TabsContent value="moderation" className="space-y-4">
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold text-slate-900">
                  Participant Support & Moderation Queue
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Review participant inquiries, study concerns, or perform manual corrections with audit logging.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">Participant Data Export & Deletion Requests</p>
                    <p className="text-slate-500 text-[11px]">
                      Under StudyLoop Trust & Privacy Charter, participants can request an export of all qualification data or initiate account deletion.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("No pending data deletion requests in queue.")}
                    className="h-8 text-xs shrink-0"
                  >
                    View Queue (0)
                  </Button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">Reported Study Protocols</p>
                    <p className="text-slate-500 text-[11px]">
                      Participant flags regarding misleading compensation, inactive clinic sites, or communication issues.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("No study flags currently reported.")}
                    className="h-8 text-xs shrink-0"
                  >
                    Review Flags (0)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
