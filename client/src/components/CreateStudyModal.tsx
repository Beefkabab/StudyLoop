import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Plus,
  Trash2,
  SlidersHorizontal,
  ClipboardCheck,
  Building2,
  DollarSign,
  Clock,
  MapPin,
  X,
  Sparkles,
  Edit3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CreateStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (createdOrUpdated?: any) => void;
  studyToEdit?: any | null;
  defaultPiName?: string;
}

export function CreateStudyModal({
  isOpen,
  onClose,
  onCreated,
  studyToEdit,
  defaultPiName,
}: CreateStudyModalProps) {
  const [title, setTitle] = useState("");
  const [sponsorName, setSponsorName] = useState("Triangle Research Network");
  const [sponsorType, setSponsorType] = useState<"university" | "hospital" | "biotech" | "pharma" | "research_center">("university");
  const [piName, setPiName] = useState("Dr. Sarah Lindquist, MD");
  const [piTitle, setPiTitle] = useState("Principal Investigator");
  const [studyType, setStudyType] = useState<"clinical_trial" | "blood_draw" | "observational_survey" | "imaging_mri" | "cognitive_assessment">("blood_draw");
  const [compensationAmount, setCompensationAmount] = useState<number>(300);
  const [compensationSchedule, setCompensationSchedule] = useState("$150 per visit (2 visits total)");
  const [timeCommitment, setTimeCommitment] = useState("2 visits, 45 mins each");
  const [durationWeeks, setDurationWeeks] = useState<number>(2);
  const [locationType, setLocationType] = useState<"in_person" | "remote" | "hybrid">("in_person");
  const [city, setCity] = useState("Durham");
  const [state, setState] = useState("NC");
  const [summary, setSummary] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [targetDemographicFocus, setTargetDemographicFocus] = useState("");
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(65);
  const [healthyVolunteersAccepted, setHealthyVolunteersAccepted] = useState<boolean>(true);
  const [targetEnrollment, setTargetEnrollment] = useState<number>(60);
  const [currentEnrolled, setCurrentEnrolled] = useState<number>(0);

  useEffect(() => {
    if (studyToEdit) {
      setTitle(studyToEdit.title || "");
      setSponsorName(studyToEdit.sponsorName || "Triangle Research Network");
      setSponsorType(studyToEdit.sponsorType || "university");
      setPiName(studyToEdit.piName || defaultPiName || "Principal Investigator");
      setPiTitle(studyToEdit.piTitle || "Principal Investigator");
      setStudyType(studyToEdit.studyType || "blood_draw");
      setCompensationAmount(studyToEdit.compensationAmount ?? 300);
      setCompensationSchedule(studyToEdit.compensationSchedule || "");
      setTimeCommitment(studyToEdit.timeCommitment || "");
      setDurationWeeks(studyToEdit.durationWeeks || 2);
      setLocationType(studyToEdit.locationType || "in_person");
      setCity(studyToEdit.city || "Durham");
      setState(studyToEdit.state || "NC");
      setSummary(studyToEdit.summary || "");
      setFullDescription(studyToEdit.fullDescription || "");
      setTargetDemographicFocus(studyToEdit.targetDemographicFocus || "");
      setMinAge(studyToEdit.minAge ?? 18);
      setMaxAge(studyToEdit.maxAge ?? 65);
      setHealthyVolunteersAccepted(studyToEdit.healthyVolunteersAccepted ?? true);
      setTargetEnrollment(studyToEdit.targetEnrollment ?? 60);
      setCurrentEnrolled(studyToEdit.currentEnrolled ?? 0);
    } else {
      setTitle("");
      setPiName(defaultPiName || "Dr. Sarah Lindquist, MD");
      setSummary("");
      setFullDescription("");
      setCompensationAmount(300);
      setCompensationSchedule("$150 per visit (2 visits total)");
      setTimeCommitment("2 visits, 45 mins each");
      setDurationWeeks(2);
      setTargetEnrollment(60);
      setCurrentEnrolled(0);
      setMinAge(18);
      setMaxAge(65);
      setHealthyVolunteersAccepted(true);
      setTargetDemographicFocus("");
    }
  }, [studyToEdit, isOpen, defaultPiName]);

  // Dynamic Screener Questions
  const [questions, setQuestions] = useState<
    Array<{
      questionText: string;
      explanation: string;
      expectedAnswer: string;
      isDisqualifying: boolean;
    }>
  >([
    {
      questionText: "Have you taken oral antibiotics in the past 30 days?",
      explanation: "Recent antibiotic therapy alters circulating blood biomarkers",
      expectedAnswer: "no",
      isDisqualifying: true,
    },
    {
      questionText: "Can you attend morning appointments at our clinical facility in Durham?",
      explanation: "Fasting blood draws require early attendance",
      expectedAnswer: "yes",
      isDisqualifying: true,
    },
  ]);

  const createMutation = trpc.studies.create.useMutation({
    onSuccess: (res) => {
      toast.success("Study protocol & dynamic screener published!", {
        description: "Your study is now live in the participant marketplace.",
      });
      onCreated(res);
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to publish study");
    },
  });

  const updateMutation = trpc.studies.update.useMutation({
    onSuccess: (res) => {
      toast.success("Study protocol updated successfully!", {
        description: "Changes are live across the recruitment pipeline.",
      });
      onCreated(res.study);
      onClose();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update study");
    },
  });

  if (!isOpen) return null;

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        explanation: "",
        expectedAnswer: "yes",
        isDisqualifying: true,
      },
    ]);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, field: string, val: any) => {
    const updated = [...questions];
    updated[idx] = { ...updated[idx], [field]: val };
    setQuestions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !summary || !fullDescription) {
      toast.error("Please fill in the title, summary, and protocol description.");
      return;
    }

    if (studyToEdit) {
      updateMutation.mutate({
        studyId: studyToEdit.id,
        title,
        summary,
        fullDescription,
        compensationAmount: Number(compensationAmount),
        compensationSchedule,
        timeCommitment,
        durationWeeks: Number(durationWeeks),
        city,
        state,
        targetEnrollment: Number(targetEnrollment),
        currentEnrolled: Number(currentEnrolled),
        minAge: Number(minAge),
        maxAge: Number(maxAge),
        healthyVolunteersAccepted,
        targetDemographicFocus: targetDemographicFocus || undefined,
      });
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).substring(2, 6);

    createMutation.mutate({
      slug,
      title,
      sponsorName,
      sponsorType,
      piName,
      piTitle,
      studyType,
      compensationAmount: Number(compensationAmount),
      compensationType: "Direct Payment (Stipend)",
      compensationSchedule,
      timeCommitment,
      durationWeeks: Number(durationWeeks),
      locationType,
      city,
      state,
      summary,
      fullDescription,
      irbApprovalNumber: "IRB-2026-" + Math.floor(1000 + Math.random() * 9000),
      targetEnrollment: Number(targetEnrollment) || 60,
      minAge: Number(minAge),
      maxAge: Number(maxAge),
      targetGender: "all",
      healthyVolunteersAccepted,
      targetDemographicFocus: targetDemographicFocus || undefined,
      questions,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl max-h-[92vh] flex flex-col my-auto animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700">
              {studyToEdit ? <Edit3 className="h-4 w-4" /> : <ClipboardCheck className="h-4 w-4" />}
              {studyToEdit ? "Manage Active Protocol & Quotas" : "Study Protocol & Screener Builder"}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              {studyToEdit ? `Manage: ${studyToEdit.title}` : "Create New Research Opportunity"}
            </h2>
            <p className="text-xs text-slate-500">
              {studyToEdit
                ? "Update protocol compensation, enrollment quotas, and inclusion parameters."
                : "Configure transparent compensation, eligibility rules, and custom pre-screeners."}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {/* Protocol Basics */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Basic Information</h3>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Study Title *</Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Healthy Volunteer Immune Baseline Study"
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Study Category</Label>
                <Select value={studyType} onValueChange={(v: any) => setStudyType(v)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="clinical_trial">Pharma Clinical Trial</SelectItem>
                    <SelectItem value="blood_draw">Blood Draw & Biomarkers</SelectItem>
                    <SelectItem value="observational_survey">Remote / Observational</SelectItem>
                    <SelectItem value="imaging_mri">fMRI / Imaging</SelectItem>
                    <SelectItem value="cognitive_assessment">Cognitive Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Format</Label>
                <Select value={locationType} onValueChange={(v: any) => setLocationType(v)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_person">In-Person Site</SelectItem>
                    <SelectItem value="remote">100% Remote / Home</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Principal Investigator</Label>
                <Input
                  required
                  value={piName}
                  onChange={(e) => setPiName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">City & State</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Durham" className="text-xs h-9" />
                  <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="NC" className="text-xs h-9" />
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Compensation & Commitment */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Compensation & Logistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Total Pay ($ USD) *</Label>
                <Input
                  type="number"
                  required
                  value={compensationAmount}
                  onChange={(e) => setCompensationAmount(Number(e.target.value))}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-xs font-semibold text-slate-700">Payment Breakdown</Label>
                <Input
                  value={compensationSchedule}
                  onChange={(e) => setCompensationSchedule(e.target.value)}
                  placeholder="e.g. $100 per visit + $100 completion stipend"
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Time Commitment</Label>
                <Input
                  value={timeCommitment}
                  onChange={(e) => setTimeCommitment(e.target.value)}
                  placeholder="e.g. 2 visits, 45 mins each"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Representation Target (Optional)</Label>
                <Input
                  value={targetDemographicFocus}
                  onChange={(e) => setTargetDemographicFocus(e.target.value)}
                  placeholder="e.g. Seeking 40% male participants & rural volunteers"
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Target Cohort</Label>
                <Input
                  type="number"
                  value={targetEnrollment}
                  onChange={(e) => setTargetEnrollment(Number(e.target.value))}
                  placeholder="60"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Enrolled</Label>
                <Input
                  type="number"
                  value={currentEnrolled}
                  onChange={(e) => setCurrentEnrolled(Number(e.target.value))}
                  placeholder="0"
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Min Age</Label>
                <Input
                  type="number"
                  value={minAge}
                  onChange={(e) => setMinAge(Number(e.target.value))}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Max Age</Label>
                <Input
                  type="number"
                  value={maxAge}
                  onChange={(e) => setMaxAge(Number(e.target.value))}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div>
                <p className="text-xs font-bold text-slate-800">Healthy Volunteers Welcome</p>
                <p className="text-[11px] text-slate-500">Allow healthy control participants to match without prior conditions.</p>
              </div>
              <Switch
                checked={healthyVolunteersAccepted}
                onCheckedChange={setHealthyVolunteersAccepted}
              />
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Plain-Language Descriptions</h3>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Marketplace Summary (Short) *</Label>
              <Textarea
                required
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="2-3 sentences explaining the study in friendly, non-jargon language."
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Full Description & Procedures *</Label>
              <Textarea
                required
                rows={4}
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Detailed explanation of what the participant will do, visits, and informed consent overview."
                className="text-xs"
              />
            </div>
          </div>

          {/* Dynamic Pre-Screener Builder */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">4. Dynamic Pre-Screener Questions</h3>
                <p className="text-[11px] text-slate-500">Only participants who answer correctly will pass into your dashboard.</p>
              </div>
              <Button type="button" onClick={addQuestion} variant="outline" size="sm" className="text-xs h-7">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Question
              </Button>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-700">Question {idx + 1}</span>
                    {questions.length > 1 && (
                      <button type="button" onClick={() => removeQuestion(idx)} className="text-slate-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <Input
                    required
                    value={q.questionText}
                    onChange={(e) => updateQuestion(idx, "questionText", e.target.value)}
                    placeholder="e.g. Have you taken oral antibiotics in the last 30 days?"
                    className="text-xs h-8 bg-white"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={q.explanation}
                      onChange={(e) => updateQuestion(idx, "explanation", e.target.value)}
                      placeholder="Why this matters (protocol reason)"
                      className="text-[11px] h-7 bg-white"
                    />

                    <div className="flex items-center gap-2">
                      <Label className="text-[10px] text-slate-600">Qualifying Answer:</Label>
                      <Select
                        value={q.expectedAnswer}
                        onValueChange={(val) => updateQuestion(idx, "expectedAnswer", val)}
                      >
                        <SelectTrigger className="text-[11px] h-7 bg-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">YES qualifies</SelectItem>
                          <SelectItem value="no">NO qualifies</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-xs text-slate-500">
              IRB Approval Status: <strong>IRB-Approved / Expedited Review</strong>
            </span>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} className="text-xs h-9">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-9 font-bold"
              >
                {studyToEdit
                  ? updateMutation.isPending
                    ? "Saving Changes..."
                    : "Save Protocol Changes"
                  : createMutation.isPending
                  ? "Publishing Protocol..."
                  : "Publish to Marketplace"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
