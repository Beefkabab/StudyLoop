import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  UserCircle2, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight,
  Info,
  Check
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function UniversalProfile() {
  const [, setLocation] = useLocation();

  // Load existing profile if key exists
  const [profileKey, setProfileKey] = useState<string>(() => {
    return localStorage.getItem("studyloop_profile_key") || "prof_" + Math.random().toString(36).substring(2, 10);
  });

  const { data: existingProfile, isLoading: isProfileLoading } = trpc.profile.get.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<number>(34);
  const [gender, setGender] = useState<"female" | "male" | "non_binary" | "prefer_not_to_say">("male");
  const [educationLevel, setEducationLevel] = useState<"high_school_or_less" | "some_college" | "bachelors" | "graduate_degree">("some_college");
  const [livingEnvironment, setLivingEnvironment] = useState<"urban" | "suburban" | "rural">("rural");
  const [city, setCity] = useState("Durham");
  const [state, setState] = useState("NC");
  const [zipCode, setZipCode] = useState("27701");
  const [travelDistanceMiles, setTravelDistanceMiles] = useState<number>(30);
  const [isHealthyVolunteer, setIsHealthyVolunteer] = useState<boolean>(true);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [hasRecentAntibiotics, setHasRecentAntibiotics] = useState<boolean>(false);
  const [smokerStatus, setSmokerStatus] = useState<"never" | "former" | "current">("never");

  // Populate form if profile exists
  useEffect(() => {
    if (existingProfile) {
      setFullName(existingProfile.fullName);
      setEmail(existingProfile.email);
      setPhone(existingProfile.phone || "");
      setAge(existingProfile.age);
      setGender(existingProfile.gender as any);
      setEducationLevel(existingProfile.educationLevel as any);
      setLivingEnvironment(existingProfile.livingEnvironment as any);
      setCity(existingProfile.city);
      setState(existingProfile.state);
      setZipCode(existingProfile.zipCode || "");
      setTravelDistanceMiles(existingProfile.travelDistanceMiles);
      setIsHealthyVolunteer(existingProfile.isHealthyVolunteer);
      setSelectedConditions((existingProfile.conditions as string[]) || []);
      setHasRecentAntibiotics(existingProfile.hasRecentAntibiotics);
      setSmokerStatus(existingProfile.smokerStatus as any);
    }
  }, [existingProfile]);

  const saveMutation = trpc.profile.save.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("studyloop_profile_key", data.profileKey);
      toast.success("Universal Profile saved!", {
        description: "Your personalized study matches are updated instantly.",
      });
      setLocation("/browse");
    },
    onError: (err) => {
      toast.error("Failed to save profile: " + err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !city || !state) {
      toast.error("Please fill in your name, email, and location.");
      return;
    }

    saveMutation.mutate({
      profileKey,
      fullName,
      email,
      phone: phone || undefined,
      age: Number(age),
      gender,
      educationLevel,
      livingEnvironment,
      city,
      state,
      zipCode: zipCode || undefined,
      travelDistanceMiles: Number(travelDistanceMiles),
      isHealthyVolunteer,
      conditions: selectedConditions,
      medications: [],
      hasRecentAntibiotics,
      smokerStatus,
    });
  };

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const loadDemoPersona = (persona: "rural_male" | "urban_student" | "chronic_patient") => {
    if (persona === "rural_male") {
      setFullName("Marcus Davis");
      setEmail("marcus.davis92@example.com");
      setPhone("919-555-0144");
      setAge(58);
      setGender("male");
      setEducationLevel("high_school_or_less");
      setLivingEnvironment("rural");
      setCity("Sanford");
      setState("NC");
      setZipCode("27330");
      setTravelDistanceMiles(45);
      setIsHealthyVolunteer(true);
      setSelectedConditions([]);
      setHasRecentAntibiotics(false);
      setSmokerStatus("never");
      toast.info("Loaded Persona: Marcus Davis (Rural Male Healthy Volunteer)");
    } else if (persona === "urban_student") {
      setFullName("Chloe Martinez");
      setEmail("chloe.m.student@example.edu");
      setPhone("919-555-0189");
      setAge(23);
      setGender("female");
      setEducationLevel("bachelors");
      setLivingEnvironment("urban");
      setCity("Durham");
      setState("NC");
      setZipCode("27701");
      setTravelDistanceMiles(15);
      setIsHealthyVolunteer(true);
      setSelectedConditions([]);
      setHasRecentAntibiotics(false);
      setSmokerStatus("never");
      toast.info("Loaded Persona: Chloe Martinez (Urban Healthy Student)");
    } else {
      setFullName("Robert Chen");
      setEmail("robert.chen.t2d@example.org");
      setPhone("919-555-0219");
      setAge(52);
      setGender("male");
      setEducationLevel("graduate_degree");
      setLivingEnvironment("suburban");
      setCity("Cary");
      setState("NC");
      setZipCode("27513");
      setTravelDistanceMiles(25);
      setIsHealthyVolunteer(false);
      setSelectedConditions(["Type 2 Diabetes", "Mild Hypertension"]);
      setHasRecentAntibiotics(false);
      setSmokerStatus("former");
      toast.info("Loaded Persona: Robert Chen (Type 2 Diabetes Patient)");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 py-10">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-semibold py-1 px-3">
            Fill Once • Match Everywhere
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Universal Health & Demographic Profile
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Clinical trials stay stalled because researchers can't find specific demographics. Your profile lets our matching algorithm bring high-paying, relevant research directly to you.
          </p>
        </div>

        {/* Demo Persona Quick Fill Bar */}
        <div className="bg-white p-4 rounded-xl border border-sky-100 shadow-xs mb-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Test with realistic research personas:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => loadDemoPersona("rural_male")}
              className="text-xs h-7 bg-slate-50 hover:bg-sky-50 border-slate-200"
            >
              Rural Male (diversity target)
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => loadDemoPersona("urban_student")}
              className="text-xs h-7 bg-slate-50 hover:bg-sky-50 border-slate-200"
            >
              Urban Student (healthy-control target)
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => loadDemoPersona("chronic_patient")}
              className="text-xs h-7 bg-slate-50 hover:bg-sky-50 border-slate-200"
            >
              Type 2 Diabetes Patient
            </Button>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-8">
          {/* Section 1: Demographics */}
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
              <UserCircle2 className="h-5 w-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900">1. Demographics & Contact</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="fullname" className="text-xs font-semibold text-slate-700">Full Name *</Label>
                <Input 
                  id="fullname"
                  required
                  placeholder="e.g. Jordan Miller"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email Address *</Label>
                <Input 
                  id="email"
                  type="email"
                  required
                  placeholder="jordan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Mobile Phone (For Visit Reminders)</Label>
                <Input 
                  id="phone"
                  placeholder="(919) 555-0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-xs font-semibold text-slate-700">Age *</Label>
                <Input 
                  id="age"
                  type="number"
                  min="18"
                  max="110"
                  required
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Gender *</Label>
                <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="non_binary">Non-binary</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-slate-400">Essential for trials balancing gender quotas</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Education Level</Label>
                <Select value={educationLevel} onValueChange={(v: any) => setEducationLevel(v)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high_school_or_less">High School or GED</SelectItem>
                    <SelectItem value="some_college">Some College / Vocational</SelectItem>
                    <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                    <SelectItem value="graduate_degree">Master's / Doctorate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section 2: Location & Geographic Diversity */}
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
              <MapPin className="h-5 w-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900">2. Location & Travel Accessibility</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Living Environment</Label>
                <Select value={livingEnvironment} onValueChange={(v: any) => setLivingEnvironment(v)}>
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urban">Urban City</SelectItem>
                    <SelectItem value="suburban">Suburban</SelectItem>
                    <SelectItem value="rural">Rural / Non-Metro</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-slate-400">Key for NIH diversity mandates</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-xs font-semibold text-slate-700">City *</Label>
                <Input 
                  id="city"
                  required
                  placeholder="e.g. Durham"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-xs font-semibold text-slate-700">State *</Label>
                <Input 
                  id="state"
                  required
                  placeholder="e.g. NC"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="zip" className="text-xs font-semibold text-slate-700">ZIP Code</Label>
                <Input 
                  id="zip"
                  placeholder="27701"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="travelDistance" className="text-xs font-semibold text-slate-700">Max Travel Distance (Miles)</Label>
                <Input 
                  id="travelDistance"
                  type="number"
                  min="5"
                  max="200"
                  value={travelDistanceMiles}
                  onChange={(e) => setTravelDistanceMiles(Number(e.target.value))}
                  className="text-xs h-9"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Baseline Health & Volunteer Type */}
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-5">
              <HeartHandshake className="h-5 w-5 text-sky-600" />
              <h2 className="text-base font-bold text-slate-900">3. Baseline Health & Participant Status</h2>
            </div>

            {/* Healthy Volunteer Toggle */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 mb-5">
              <div>
                <Label htmlFor="healthy-switch" className="text-sm font-bold text-slate-900 cursor-pointer">
                  I consider myself a Healthy Volunteer
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check this if you have no major chronic medical conditions and are seeking control/biomarker studies for compensation.
                </p>
              </div>
              <Switch 
                id="healthy-switch"
                checked={isHealthyVolunteer}
                onCheckedChange={setIsHealthyVolunteer}
              />
            </div>

            {/* Conditions Selection */}
            <div className="space-y-2 mb-5">
              <Label className="text-xs font-semibold text-slate-700">
                Any diagnosed chronic health conditions? (Select all that apply)
              </Label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Type 2 Diabetes", 
                  "Mild Cognitive Impairment", 
                  "Asthma / COPD", 
                  "Mild Hypertension", 
                  "Osteoarthritis", 
                  "Migraine", 
                  "Depression / Anxiety"
                ].map((cond) => {
                  const isSelected = selectedConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                        isSelected 
                          ? "bg-sky-600 text-white border-sky-600" 
                          : "bg-white text-slate-700 border-slate-200 hover:border-sky-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                      {cond}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Antibiotic & Lifestyle Screeners */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                <Label className="text-xs font-semibold text-slate-800">
                  Taken oral antibiotics in last 30 days?
                </Label>
                <Select 
                  value={hasRecentAntibiotics ? "yes" : "no"} 
                  onValueChange={(v) => setHasRecentAntibiotics(v === "yes")}
                >
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No antibiotics in last 30 days</SelectItem>
                    <SelectItem value="yes">Yes, took antibiotics recently</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-[10px] text-slate-400">Important for blood biomarker and microbiome studies</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                <Label className="text-xs font-semibold text-slate-800">
                  Tobacco / Smoking Status
                </Label>
                <Select value={smokerStatus} onValueChange={(v: any) => setSmokerStatus(v)}>
                  <SelectTrigger className="text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never smoked</SelectItem>
                    <SelectItem value="former">Former smoker</SelectItem>
                    <SelectItem value="current">Current smoker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Privacy & IRB Safeguards */}
          <div className="p-4 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-sky-900 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-sky-950">Patient Privacy Guaranteed: </strong>
              Your contact details are encrypted and only released to research study coordinators after you explicitly pass their dynamic pre-screener.
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs px-6 py-2 h-10 rounded-xl shadow-xs flex items-center gap-2"
            >
              {saveMutation.isPending ? "Calculating Matches..." : "Save Profile & View Matches"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
