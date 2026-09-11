import { useState } from "react";
import { Link } from "wouter";
import { 
  DollarSign, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Building, 
  Sparkles, 
  ChevronRight,
  ShieldAlert,
  Flame,
  Award,
  Bookmark
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface StudyCardProps {
  study: {
    id: number;
    slug: string;
    title: string;
    sponsorName: string;
    sponsorType: string;
    piName: string;
    studyType: string;
    compensationAmount: number;
    compensationType: string;
    compensationSchedule?: string | null;
    timeCommitment: string;
    locationType: string;
    city: string;
    state: string;
    summary: string;
    healthyVolunteersAccepted: boolean;
    targetDemographicFocus?: string | null;
    isFeatured?: boolean;
    isSponsored?: boolean;
    matchScore?: number | null;
    matchReasons?: string[];
    matchFlags?: string[];
  };
}

const studyTypeLabels: Record<string, { label: string; color: string }> = {
  clinical_trial: { label: "Clinical Trial", color: "bg-blue-50 text-blue-700 border-blue-200" },
  blood_draw: { label: "Blood Draw", color: "bg-rose-50 text-rose-700 border-rose-200" },
  observational_survey: { label: "Remote & Survey", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  imaging_mri: { label: "fMRI Imaging", color: "bg-purple-50 text-purple-700 border-purple-200" },
  cognitive_assessment: { label: "Cognitive Test", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

export function StudyCard({ study }: StudyCardProps) {
  const [isSaved, setIsSaved] = useState(false);
  const profileKey = typeof window !== "undefined" ? localStorage.getItem("studyloop_profile_key") || "demo_profile_rural_male" : "";

  const toggleSaveMutation = trpc.saved.toggle.useMutation({
    onSuccess: (data) => {
      setIsSaved(data.saved);
      toast.success(data.saved ? "Study saved to your profile!" : "Study removed from saved list", {
        description: data.saved ? "You can review it anytime from your dashboard." : undefined,
      });
    },
  });

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveMutation.mutate({ profileKey, studyId: study.id });
  };

  const typeConfig = studyTypeLabels[study.studyType] || {
    label: study.studyType.replace("_", " "),
    color: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const hasScore = typeof study.matchScore === "number";

  return (
    <div className={`group relative rounded-2xl bg-white p-5 sm:p-6 transition-all duration-200 border ${
      study.isFeatured 
        ? "border-sky-300 shadow-sm hover:shadow-md hover:border-sky-500" 
        : "border-slate-200/80 shadow-xs hover:border-slate-300 hover:shadow-sm"
    }`}>
      {/* Top badges: Match score, Sponsored, Study Type, Bookmark */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeConfig.color}`}>
            {typeConfig.label}
          </Badge>

          {study.healthyVolunteersAccepted && (
            <Badge variant="outline" className="text-xs font-medium bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Healthy Volunteers OK
            </Badge>
          )}

          {study.isSponsored && (
            <Badge variant="outline" className="text-xs font-medium bg-amber-50 text-amber-800 border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
              Featured Study
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasScore && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
              study.matchScore! >= 80 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : study.matchScore! >= 60 
                ? "bg-sky-50 text-sky-800 border-sky-200" 
                : "bg-slate-100 text-slate-700 border-slate-200"
            }`}>
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
              <span>{study.matchScore}% Match</span>
            </div>
          )}

          <button
            onClick={handleToggleSave}
            title={isSaved ? "Saved" : "Save study"}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSaved
                ? "bg-amber-50 border-amber-200 text-amber-600"
                : "bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? "fill-amber-500 text-amber-500" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Title & Sponsor */}
      <div className="mb-3">
        <Link href={`/study/${study.slug}`}>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors line-clamp-2">
            {study.title}
          </h3>
        </Link>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
          <Building className="h-3.5 w-3.5 text-slate-400" />
          <span>{study.sponsorName}</span>
          <span className="text-slate-300">•</span>
          <span>Lead PI: {study.piName}</span>
        </div>
      </div>

      {/* Summary paragraph */}
      <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
        {study.summary}
      </p>

      {/* Diversity target tag */}
      {study.targetDemographicFocus && (
        <div className="mb-4 text-xs bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-slate-600 flex items-start gap-2">
          <Award className="h-3.5 w-3.5 text-sky-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800 font-semibold">Recruitment Focus: </strong>
            {study.targetDemographicFocus}
          </div>
        </div>
      )}

      {/* Why you matched pills */}
      {hasScore && study.matchReasons && study.matchReasons.length > 0 && (
        <div className="mb-4 bg-emerald-50/70 border border-emerald-100 rounded-lg p-2.5 text-xs text-emerald-900 space-y-1">
          <div className="font-semibold flex items-center gap-1 text-emerald-800">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Why your profile matched:
          </div>
          <ul className="list-disc list-inside text-emerald-700 text-[11px] space-y-0.5">
            {study.matchReasons.slice(0, 2).map((r, idx) => (
              <li key={idx}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Row */}
      <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <div className="h-7 w-7 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center font-bold text-sm">
              $
            </div>
            <div>
              <div className="text-base sm:text-lg font-extrabold text-emerald-700 leading-tight">
                ${study.compensationAmount}
              </div>
              <div className="text-[10px] text-slate-400 font-normal">Stipend / Pay</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <div className="font-medium text-slate-800">{study.timeCommitment}</div>
              <div className="text-[10px] text-slate-400">Commitment</div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <div>
              <div className="font-medium text-slate-800">
                {study.locationType === "remote" ? "Remote (Home)" : `${study.city}, ${study.state}`}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">{study.locationType.replace("_", " ")}</div>
            </div>
          </div>
        </div>

        <Link href={`/study/${study.slug}`}>
          <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold px-4 flex items-center gap-1 shadow-xs">
            Review & Apply
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
