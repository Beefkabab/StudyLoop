import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  ClipboardCheck, 
  Bookmark, 
  CalendarCheck, 
  Bell, 
  Clock, 
  DollarSign, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  UserCircle2,
  LogIn,
  LogOut,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudyCard } from "@/components/StudyCard";
import { toast } from "sonner";

export default function ParticipantDashboard() {
  const [, setLocation] = useLocation();
  const [profileKey, setProfileKey] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"applications" | "saved" | "reminders" | "all_studies">("applications");
  const [guestSavedIds, setGuestSavedIds] = useState<number[]>([]);

  useEffect(() => {
    // Only load actual saved profileKey (DO NOT force fallback to demo profile)
    const key = localStorage.getItem("studyloop_profile_key") || "";
    setProfileKey(key);

    try {
      const saved: number[] = JSON.parse(localStorage.getItem("studyloop_saved_ids") || "[]");
      setGuestSavedIds(saved);
    } catch {
      // ignore
    }
  }, []);

  const { data: profile } = trpc.profile.get.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  const { data: applications, isLoading: appsLoading } = trpc.applications.myApplications.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  const { data: savedStudies, isLoading: savedLoading } = trpc.saved.list.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  const { data: reminders, isLoading: remindersLoading } = trpc.applications.myReminders.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  // Fetch all listed studies so visitors can browse directly
  const { data: allStudies, isLoading: studiesLoading } = trpc.studies.list.useQuery({
    profileKey: profileKey || undefined,
  });

  const handleClearSession = () => {
    localStorage.removeItem("studyloop_profile_key");
    localStorage.removeItem("studyloop_session_user");
    setProfileKey("");
    toast.info("Switched to guest view");
  };

  const handleLoadDemo = () => {
    localStorage.setItem("studyloop_profile_key", "demo_profile_rural_male");
    setProfileKey("demo_profile_rural_male");
    toast.success("Loaded demo participant profile (Marcus Davis)");
  };

  // Saved studies for guests using localStorage
  const effectiveSavedStudies = profileKey
    ? (savedStudies || [])
    : (allStudies?.filter((s) => guestSavedIds.includes(s.id)) || []);

  const statusMap: Record<string, { label: string; color: string; desc: string }> = {
    screener_passed: {
      label: "Qualified (Site Handoff Complete)",
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      desc: "Your pre-screener qualified! The study coordinator has received your profile and will contact you.",
    },
    scheduled: {
      label: "Initial Visit Booked",
      color: "bg-sky-50 text-sky-800 border-sky-200",
      desc: "Appointment confirmed. Review preparation instructions and bring your photo ID.",
    },
    pending_contact: {
      label: "Coordinator Review",
      color: "bg-amber-50 text-amber-800 border-amber-200",
      desc: "Research team is reviewing your schedule and transport logistics.",
    },
    screened_out: {
      label: "Not Eligible for Protocol",
      color: "bg-slate-100 text-slate-700 border-slate-200",
      desc: "Based on protocol requirements, this trial was not a fit. Explore other opportunities below.",
    },
  };

  const totalAppsCount = applications?.length || 0;
  const totalSavedCount = effectiveSavedStudies.length;
  const totalRemindersCount = reminders?.length || 0;

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-slate-200 py-8">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-semibold">
                {profile ? "Participant Portal" : "Applications & Opportunities"}
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {profile ? `Welcome back, ${profile.fullName}` : "My Applications & Listed Studies"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {profile
                  ? "Track your active applications, scheduled appointments, and saved opportunities."
                  : "Review your submitted pre-screeners or explore active clinical trials open for enrollment."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {profile ? (
                <>
                  <Link href="/profile">
                    <Button variant="outline" size="sm" className="text-xs h-9">
                      <UserCircle2 className="h-4 w-4 mr-1 text-slate-500" />
                      Edit Health Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearSession}
                    className="text-xs h-9 text-slate-500 hover:text-slate-900"
                    title="Sign out to guest view"
                  >
                    <LogOut className="h-3.5 w-3.5 mr-1" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleLoadDemo}
                    className="text-xs text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-2 rounded-lg font-semibold transition-colors"
                  >
                    ✨ View Demo Profile
                  </button>
                  <Link href="/login">
                    <Button variant="outline" size="sm" className="text-xs h-9">
                      <LogIn className="h-3.5 w-3.5 mr-1" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/browse">
                    <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-9 font-semibold">
                      <Search className="h-3.5 w-3.5 mr-1" />
                      Browse All Studies
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Active Applications</span>
                <ClipboardCheck className="h-4 w-4 text-sky-600" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                {totalAppsCount}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Saved Opportunities</span>
                <Bookmark className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                {totalSavedCount}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Reminders & Visits</span>
                <CalendarCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-2">
                {totalRemindersCount}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mt-6 border-b border-slate-200 pb-px">
            <button
              onClick={() => setActiveTab("applications")}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === "applications"
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              My Applications ({totalAppsCount})
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === "saved"
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Saved Studies ({totalSavedCount})
            </button>
            <button
              onClick={() => setActiveTab("reminders")}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === "reminders"
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Reminders & Checklists ({totalRemindersCount})
            </button>
            <button
              onClick={() => setActiveTab("all_studies")}
              className={`pb-2 px-3 text-xs font-bold border-b-2 transition-all ${
                activeTab === "all_studies"
                  ? "border-sky-600 text-sky-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Listed Studies ({allStudies?.length || 0})
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="container mt-6">
        {/* ==================== TAB 1: APPLICATIONS ==================== */}
        {activeTab === "applications" && (
          <div className="space-y-8">
            {appsLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading applications...</div>
            ) : applications && applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map(({ application, study }) => {
                  const statusInfo = statusMap[application.status] || {
                    label: application.status,
                    color: "bg-slate-100 text-slate-700 border-slate-200",
                    desc: "Application in progress",
                  };

                  return (
                    <div
                      key={application.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant="outline" className={`text-xs font-bold px-2.5 py-0.5 ${statusInfo.color}`}>
                          {statusInfo.label}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          Applied {new Date(application.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <Link href={`/study/${study.slug}`}>
                          <h3 className="text-lg font-bold text-slate-900 hover:text-sky-600 transition-colors">
                            {study.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 mt-1">
                          {study.sponsorName} • Lead PI: {study.piName}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <strong>Status Update: </strong>
                        {application.researcherNotes || statusInfo.desc}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-4 text-slate-600">
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" />
                            ${study.compensationAmount} Pay
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            {study.timeCommitment}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {study.city}, {study.state}
                          </span>
                        </div>

                        <Link href={`/study/${study.slug}`}>
                          <Button variant="outline" size="sm" className="text-xs h-8">
                            View Study Details <ChevronRight className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* GUEST / NO APPLICATION STATE */
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mx-auto">
                    <ClipboardCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">No active applications submitted yet</h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    Taking a 2-minute pre-screener on any study requires zero sign-in. As soon as you pre-screen for a protocol, your application status and coordinator timeline will appear here.
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    <Link href="/browse">
                      <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold">
                        Browse All Opportunities
                      </Button>
                    </Link>
                    <Link href="/how-it-works">
                      <Button variant="outline" size="sm" className="text-xs">
                        How Applying Works
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* SHOW LISTED STUDIES DIRECTLY ON THIS PAGE */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900">
                        Listed Studies Ready for Pre-Screening
                      </h3>
                      <p className="text-xs text-slate-500">
                        Choose any study to review protocol details or start a 2-minute pre-screener.
                      </p>
                    </div>
                    <Link href="/browse" className="text-xs font-bold text-sky-600 hover:underline">
                      View all ({allStudies?.length || 0})
                    </Link>
                  </div>

                  <div className="space-y-4">
                    {studiesLoading ? (
                      <div className="p-8 text-center text-xs text-slate-400">Loading open studies...</div>
                    ) : (
                      allStudies?.slice(0, 4).map((study) => (
                        <StudyCard key={study.id} study={study} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: SAVED STUDIES ==================== */}
        {activeTab === "saved" && (
          <div className="space-y-4">
            {savedLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading saved studies...</div>
            ) : effectiveSavedStudies.length > 0 ? (
              <div className="space-y-4">
                {effectiveSavedStudies.map((study) => (
                  <StudyCard key={study.id} study={study} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <Bookmark className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No saved studies</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Bookmark studies with the bookmark icon on any card to compare compensation, schedules, and locations before applying.
                </p>
                <div className="pt-2 flex justify-center">
                  <Link href="/browse">
                    <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white text-xs">
                      Explore Open Studies
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 3: REMINDERS ==================== */}
        {activeTab === "reminders" && (
          <div className="space-y-3">
            {remindersLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading reminders...</div>
            ) : reminders && reminders.length > 0 ? (
              reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CalendarCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{rem.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">{rem.notes}</p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-400">
                        <span>Scheduled: {new Date(rem.scheduledFor).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="uppercase">{rem.channel} reminder</span>
                      </div>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-600 border-slate-200 shrink-0">
                    Active
                  </Badge>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                <Bell className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800 text-base">No upcoming reminders</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  When you pass a pre-screener, coordinator appointments and visit preparation reminders will appear here automatically.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 4: ALL LISTED STUDIES ==================== */}
        {activeTab === "all_studies" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">All Available Studies</h3>
                <p className="text-xs text-slate-500">
                  Compensated medical research open for enrollment in your region.
                </p>
              </div>
              <Link href="/browse">
                <Button variant="outline" size="sm" className="text-xs">
                  <Filter className="h-3.5 w-3.5 mr-1" />
                  Advanced Filter
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              {allStudies?.map((study) => (
                <StudyCard key={study.id} study={study} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
