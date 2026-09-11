import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { StudyCard } from "@/components/StudyCard";
import { 
  Search, 
  Filter, 
  Sparkles, 
  SlidersHorizontal, 
  CheckCircle2, 
  RefreshCw,
  UserCircle2,
  DollarSign,
  HeartHandshake
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function BrowseStudies() {
  const [profileKey, setProfileKey] = useState<string>("");
  const [search, setSearch] = useState("");
  const [studyType, setStudyType] = useState("all");
  const [locationType, setLocationType] = useState("all");
  const [isHealthyOnly, setIsHealthyOnly] = useState(false);

  useEffect(() => {
    const key = localStorage.getItem("studyloop_profile_key") || "";
    setProfileKey(key);
  }, []);

  const { data: profile } = trpc.profile.get.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  const { data: studies, isLoading, refetch } = trpc.studies.list.useQuery({
    search: search || undefined,
    studyType: studyType !== "all" ? studyType : undefined,
    locationType: locationType !== "all" ? locationType : undefined,
    isHealthyOnly: isHealthyOnly || undefined,
    profileKey: profileKey || undefined,
  });

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20">
      {/* Top Banner / Marketplace Header */}
      <div className="bg-white border-b border-slate-200/80 py-8 md:py-10">
        <div className="container">
          <div className="max-w-3xl space-y-2">
            <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-semibold py-1 px-2.5">
              Opportunity Marketplace
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Compensated Medical Research
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              Find clinical trials, observational surveys, and healthy control studies. Filter transparently by pay, time commitment, and location.
            </p>
          </div>

          {/* Profile Match Status Banner */}
          {profile ? (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  {profile.fullName.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Personalized for {profile.fullName}
                    <Badge variant="outline" className="text-[10px] bg-emerald-100 text-emerald-800 border-emerald-200 font-semibold">
                      Matching Active
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-600">
                    Age {profile.age} • {profile.city}, {profile.state} • {profile.isHealthyVolunteer ? "Healthy Volunteer" : "Specific Conditions"} • {profile.livingEnvironment}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <Button variant="outline" size="sm" className="bg-white text-xs text-slate-700 hover:text-sky-600">
                    Edit Health Profile
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-teal-50 border border-sky-200">
              <div className="flex items-center gap-3 text-slate-800">
                <Sparkles className="h-5 w-5 text-sky-600 shrink-0" />
                <div className="text-xs sm:text-sm">
                  <span className="font-bold text-slate-900">Zero-Barrier Guest Access: </span>
                  You can explore full protocols and complete 2-minute pre-screeners without signing in. Or create a Universal Profile once for automatic match ranking.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/how-it-works">
                  <Button variant="outline" size="sm" className="bg-white text-xs text-slate-700 hover:text-sky-600">
                    How It Works
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold">
                    Set Up Profile
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Filter & Listing Content */}
      <div className="container mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1 space-y-5">
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Filter className="h-4 w-4 text-sky-600" />
                  Filter Studies
                </span>
                <button 
                  onClick={() => {
                    setSearch("");
                    setStudyType("all");
                    setLocationType("all");
                    setIsHealthyOnly(false);
                  }}
                  className="text-xs text-slate-500 hover:text-sky-600 transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Keyword Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Keyword or Location</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="e.g. Memory, Sleep, Durham..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 text-xs h-9"
                  />
                </div>
              </div>

              {/* Study Type Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Study Category</label>
                <Select value={studyType} onValueChange={setStudyType}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Study Categories</SelectItem>
                    <SelectItem value="cognitive_assessment">Cognitive & Sensory Tests</SelectItem>
                    <SelectItem value="blood_draw">Blood Draw & Biomarkers</SelectItem>
                    <SelectItem value="observational_survey">Remote / Observational</SelectItem>
                    <SelectItem value="clinical_trial">Pharma Clinical Trials</SelectItem>
                    <SelectItem value="imaging_mri">fMRI & Brain Imaging</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location Format Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Format / Location</label>
                <Select value={locationType} onValueChange={setLocationType}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue placeholder="All Formats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="in_person">In-Person Site Only</SelectItem>
                    <SelectItem value="remote">100% Remote / Home</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Healthy Volunteer Toggle */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="healthy-toggle" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    Healthy Volunteers
                  </Label>
                  <p className="text-[11px] text-slate-500">No condition required</p>
                </div>
                <Switch 
                  id="healthy-toggle"
                  checked={isHealthyOnly}
                  onCheckedChange={setIsHealthyOnly}
                />
              </div>

              {/* Researcher Interview Context Box */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-slate-800 flex items-center gap-1">
                  <HeartHandshake className="h-3.5 w-3.5 text-sky-600" />
                  Regional Research Network
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Featured studies curated directly from regional academic aging and immunology labs.
                </p>
              </div>
            </div>
          </div>

          {/* Study List Feed */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>
                Showing <strong className="text-slate-900 font-semibold">{studies?.length || 0}</strong> research opportunities
                {profile && " (ranked by compatibility)"}
              </span>
              {isLoading && (
                <span className="flex items-center gap-1 text-sky-600 font-medium">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Refreshing matches...
                </span>
              )}
            </div>

            {/* Study Cards */}
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-2xl bg-white border border-slate-200 animate-pulse" />
                ))}
              </div>
            ) : studies && studies.length > 0 ? (
              <div className="space-y-4">
                {studies.map((study) => (
                  <StudyCard key={study.id} study={study} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-white p-12 text-center border border-slate-200 space-y-3">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">No matching studies found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try broadening your search keywords, resetting the filters, or adjusting your demographic criteria.
                </p>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setStudyType("all");
                    setLocationType("all");
                    setIsHealthyOnly(false);
                  }}
                  className="text-xs"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
