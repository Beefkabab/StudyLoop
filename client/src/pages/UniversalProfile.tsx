import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  UserCircle2, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  Info,
  Check,
  Calendar,
  Phone,
  Mail,
  Car,
  Accessibility,
  Wifi,
  Smartphone,
  Globe,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Clock
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function UniversalProfile() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Load existing profile if key exists
  const [profileKey, setProfileKey] = useState<string>(() => {
    return localStorage.getItem("studyloop_profile_key") || "prof_" + Math.random().toString(36).substring(2, 10);
  });

  const { data: existingProfile, isLoading: isProfileLoading } = trpc.profile.get.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  const { data: completionData, refetch: refetchCompletion } = trpc.profile.completionStatus.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  // Step 1: Demographics & Contact
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState<number>(34);
  const [gender, setGender] = useState<"female" | "male" | "non_binary" | "prefer_not_to_say">("male");
  const [educationLevel, setEducationLevel] = useState<"high_school_or_less" | "some_college" | "bachelors" | "graduate_degree">("some_college");
  const [preferredContactMethod, setPreferredContactMethod] = useState<"email" | "phone" | "sms">("email");

  // Step 2: Location & Preferences
  const [livingEnvironment, setLivingEnvironment] = useState<"urban" | "suburban" | "rural">("rural");
  const [city, setCity] = useState("Durham");
  const [state, setState] = useState("NC");
  const [zipCode, setZipCode] = useState("27701");
  const [travelDistanceMiles, setTravelDistanceMiles] = useState<number>(30);
  const [remotePreference, setRemotePreference] = useState<"in_person" | "remote" | "hybrid" | "any">("hybrid");
  const [availabilitySchedule, setAvailabilitySchedule] = useState("Weekdays & Saturdays");
  const [preferredLanguage, setPreferredLanguage] = useState("English");

  // Step 3: Research Interests & Compensation
  const [isHealthyVolunteer, setIsHealthyVolunteer] = useState<boolean>(true);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [preferredStudyTypes, setPreferredStudyTypes] = useState<string[]>(["clinical_trial", "biomarker"]);
  const [compensationExpectation, setCompensationExpectation] = useState("$250 - $1,000+");
  const [hasRecentAntibiotics, setHasRecentAntibiotics] = useState<boolean>(false);
  const [smokerStatus, setSmokerStatus] = useState<"never" | "former" | "current">("never");

  // Step 4: Logistics & Accessibility
  const [transportationAccess, setTransportationAccess] = useState<"personal_vehicle" | "public_transit" | "rideshare" | "needs_assistance" | "none">("personal_vehicle");
  const [accessibilityNeeds, setAccessibilityNeeds] = useState("");
  const [caregiverRequired, setCaregiverRequired] = useState(false);
  const [hasReliableInternet, setHasReliableInternet] = useState(true);
  const [hasSmartphone, setHasSmartphone] = useState(true);

  // Populate form if profile exists
  useEffect(() => {
    if (existingProfile) {
      setFullName(existingProfile.fullName);
      setEmail(existingProfile.email);
      setPhone(existingProfile.phone || "");
      setAge(existingProfile.age);
      setGender(existingProfile.gender as any);
      setEducationLevel(existingProfile.educationLevel as any);
      setPreferredContactMethod((existingProfile as any).preferredContactMethod || "email");

      setLivingEnvironment(existingProfile.livingEnvironment as any);
      setCity(existingProfile.city);
      setState(existingProfile.state);
      setZipCode(existingProfile.zipCode || "");
      setTravelDistanceMiles(existingProfile.travelDistanceMiles);
      setRemotePreference((existingProfile as any).remotePreference || "hybrid");
      setAvailabilitySchedule((existingProfile as any).availabilitySchedule || "Flexible weekdays");
      setPreferredLanguage((existingProfile as any).preferredLanguage || "English");

      setIsHealthyVolunteer(existingProfile.isHealthyVolunteer);
      setSelectedConditions((existingProfile.conditions as string[]) || []);
      setPreferredStudyTypes(((existingProfile as any).preferredStudyTypes as string[]) || ["clinical_trial"]);
      setCompensationExpectation((existingProfile as any).compensationExpectation || "Market rate");
      setHasRecentAntibiotics(existingProfile.hasRecentAntibiotics);
      setSmokerStatus(existingProfile.smokerStatus as any);

      setTransportationAccess((existingProfile as any).transportationAccess || "personal_vehicle");
      setAccessibilityNeeds((existingProfile as any).accessibilityNeeds || "");
      setCaregiverRequired(Boolean((existingProfile as any).caregiverRequired));
      setHasReliableInternet((existingProfile as any).hasReliableInternet ?? true);
      setHasSmartphone((existingProfile as any).hasSmartphone ?? true);
    }
  }, [existingProfile]);

  const saveMutation = trpc.profile.save.useMutation({
    onSuccess: (data) => {
      localStorage.setItem("studyloop_profile_key", data.profileKey);
      refetchCompletion();
      toast.success("StudyLoop Passport Saved!", {
        description: "Your reusable research profile and match scores are up to date.",
      });
      setLocation("/my-studies");
    },
    onError: (err) => {
      toast.error("Failed to save profile: " + err.message);
    },
  });

  const handleSave = () => {
    if (!fullName || !email || !city || !state) {
      toast.error("Please fill in required fields: Name, Email, City, and State.");
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
      preferredContactMethod,
      preferredLocationType: remotePreference === "any" ? "no_preference" : remotePreference,
      preferredLanguage,
      transportationAccess,
      accessibilityNeeds: accessibilityNeeds || undefined,
      hasCaregiver: caregiverRequired,
      hasInternetSmartphone: hasReliableInternet && hasSmartphone,
    });
  };

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const toggleStudyType = (type: string) => {
    if (preferredStudyTypes.includes(type)) {
      setPreferredStudyTypes(preferredStudyTypes.filter((t) => t !== type));
    } else {
      setPreferredStudyTypes([...preferredStudyTypes, type]);
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
      setPreferredContactMethod("phone");
      setLivingEnvironment("rural");
      setCity("Sanford");
      setState("NC");
      setZipCode("27330");
      setTravelDistanceMiles(45);
      setRemotePreference("hybrid");
      setAvailabilitySchedule("Mornings & weekends");
      setPreferredLanguage("English");
      setIsHealthyVolunteer(true);
      setSelectedConditions([]);
      setPreferredStudyTypes(["clinical_trial", "biomarker"]);
      setCompensationExpectation("$300 - $1,500");
      setHasRecentAntibiotics(false);
      setSmokerStatus("never");
      setTransportationAccess("personal_vehicle");
      setAccessibilityNeeds("Ground floor or elevator preferred");
      setCaregiverRequired(false);
      setHasReliableInternet(true);
      setHasSmartphone(true);
      toast.info("Loaded Persona: Marcus Davis (Rural Male Healthy Volunteer)");
    } else if (persona === "urban_student") {
      setFullName("Chloe Martinez");
      setEmail("chloe.m.student@example.edu");
      setPhone("919-555-0189");
      setAge(23);
      setGender("female");
      setEducationLevel("bachelors");
      setPreferredContactMethod("sms");
      setLivingEnvironment("urban");
      setCity("Durham");
      setState("NC");
      setZipCode("27701");
      setTravelDistanceMiles(15);
      setRemotePreference("any");
      setAvailabilitySchedule("Afternoons & evenings");
      setPreferredLanguage("English");
      setIsHealthyVolunteer(true);
      setSelectedConditions([]);
      setPreferredStudyTypes(["survey", "biomarker"]);
      setCompensationExpectation("$100 - $500");
      setHasRecentAntibiotics(false);
      setSmokerStatus("never");
      setTransportationAccess("public_transit");
      setAccessibilityNeeds("");
      setCaregiverRequired(false);
      setHasReliableInternet(true);
      setHasSmartphone(true);
      toast.info("Loaded Persona: Chloe Martinez (Urban Healthy Student)");
    } else {
      setFullName("Robert Chen");
      setEmail("robert.chen.t2d@example.org");
      setPhone("919-555-0219");
      setAge(52);
      setGender("male");
      setEducationLevel("graduate_degree");
      setPreferredContactMethod("email");
      setLivingEnvironment("suburban");
      setCity("Cary");
      setState("NC");
      setZipCode("27513");
      setTravelDistanceMiles(25);
      setRemotePreference("in_person");
      setAvailabilitySchedule("Friday mornings");
      setPreferredLanguage("English");
      setIsHealthyVolunteer(false);
      setSelectedConditions(["Type 2 Diabetes", "Mild Hypertension"]);
      setPreferredStudyTypes(["clinical_trial", "longitudinal"]);
      setCompensationExpectation("$500 - $2,000");
      setHasRecentAntibiotics(false);
      setSmokerStatus("former");
      setTransportationAccess("personal_vehicle");
      setAccessibilityNeeds("");
      setCaregiverRequired(false);
      setHasReliableInternet(true);
      setHasSmartphone(true);
      toast.info("Loaded Persona: Robert Chen (Type 2 Diabetes Patient)");
    }
  };

  const steps = [
    { num: 1, label: "Contact & Identity" },
    { num: 2, label: "Commute & Settings" },
    { num: 3, label: "Research Interests" },
    { num: 4, label: "Logistics & Access" },
    { num: 5, label: "Passport Review" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/60 py-10">
      <div className="container max-w-3xl">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <Badge variant="outline" className="bg-sky-50 text-sky-700 border-sky-200 text-xs font-semibold py-1 px-3">
            StudyLoop Passport • Fill Once • Match Everywhere
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Reusable Participant Profile
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Create your portable profile to apply with 1-click across all verified clinical trials.
            Your sensitive information remains strictly confidential until you apply.
          </p>
        </div>

        {/* Quick-fill Demo Personas */}
        <div className="bg-white p-3.5 rounded-xl border border-sky-100 shadow-xs mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Pre-fill with research personas:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => loadDemoPersona("rural_male")}
              className="text-xs h-7 bg-slate-50 hover:bg-sky-50 border-slate-200"
            >
              Marcus (Rural Volunteer)
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => loadDemoPersona("urban_student")}
              className="text-xs h-7 bg-slate-50 hover:bg-sky-50 border-slate-200"
            >
              Chloe (Student Healthy Control)
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => loadDemoPersona("chronic_patient")}
              className="text-xs h-7 bg-slate-50 hover:bg-sky-50 border-slate-200"
            >
              Robert (Type 2 Diabetes)
            </Button>
          </div>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-700">
            <span>Step {currentStep} of 5: {steps[currentStep - 1].label}</span>
            <span className="text-sky-600 font-bold">
              {completionData?.percentage || Math.round((currentStep / 5) * 100)}% Profile Complete
            </span>
          </div>
          <Progress 
            value={completionData?.percentage || (currentStep / 5) * 100} 
            className="h-2 bg-slate-100 [&>div]:bg-sky-600"
          />

          <div className="grid grid-cols-5 gap-1 mt-4">
            {steps.map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => setCurrentStep(s.num)}
                className={`text-left p-1.5 rounded-lg transition-colors ${
                  currentStep === s.num
                    ? "bg-sky-50 border-sky-300 border"
                    : currentStep > s.num
                    ? "text-slate-700 hover:bg-slate-50"
                    : "text-slate-400 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-semibold">
                  <span className={`h-4 w-4 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === s.num ? "bg-sky-600 text-white" : currentStep > s.num ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {currentStep > s.num ? "✓" : s.num}
                  </span>
                  <span className="hidden sm:inline truncate">{s.label.split(" ")[0]}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Step Wizard Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">

          {/* STEP 1: Contact & Demographics */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <UserCircle2 className="h-5 w-5 text-sky-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 1: Contact & Baseline Demographics</h2>
                  <p className="text-xs text-slate-500">Contact information is encrypted and only released when you qualify for a study.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fullname" className="text-xs font-semibold text-slate-700">Full Legal Name *</Label>
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
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-700">Mobile Phone</Label>
                  <Input 
                    id="phone"
                    placeholder="(919) 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="text-xs h-9"
                  />
                  <p className="text-[10px] text-slate-400">Used for visit scheduling and coordinator outreach.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Preferred Contact Method</Label>
                  <Select value={preferredContactMethod} onValueChange={(v: any) => setPreferredContactMethod(v)}>
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="sms">Text Message (SMS)</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <span className="text-[10px] text-slate-400">Required for trials balancing gender quotas.</span>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold text-slate-700">Education Level</Label>
                  <Select value={educationLevel} onValueChange={(v: any) => setEducationLevel(v)}>
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high_school_or_less">High School or GED</SelectItem>
                      <SelectItem value="some_college">Some College / Vocational Training</SelectItem>
                      <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                      <SelectItem value="graduate_degree">Master's / Doctorate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Location & Commute Preferences */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MapPin className="h-5 w-5 text-sky-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 2: Commute, Location & Participation Preferences</h2>
                  <p className="text-xs text-slate-500">Filter studies by location, remote flexibility, and convenience.</p>
                </div>
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
                  <span className="text-[10px] text-slate-400">Helps sites fulfill geographic diversity grants.</span>
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
                  <Label htmlFor="travelDistance" className="text-xs font-semibold text-slate-700">Max Travel Radius (Miles)</Label>
                  <Input 
                    id="travelDistance"
                    type="number"
                    min="5"
                    max="250"
                    value={travelDistanceMiles}
                    onChange={(e) => setTravelDistanceMiles(Number(e.target.value))}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Trial Format Preference</Label>
                  <Select value={remotePreference} onValueChange={(v: any) => setRemotePreference(v)}>
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_person">In-Person Clinic Visits Only</SelectItem>
                      <SelectItem value="remote">Fully Remote / At-Home Only</SelectItem>
                      <SelectItem value="hybrid">Hybrid (Occasional Visits)</SelectItem>
                      <SelectItem value="any">Open to Any Format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="availability" className="text-xs font-semibold text-slate-700">General Availability</Label>
                  <Input 
                    id="availability"
                    placeholder="e.g. Weekdays 9am-1pm, or Saturdays"
                    value={availabilitySchedule}
                    onChange={(e) => setAvailabilitySchedule(e.target.value)}
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Primary Language</Label>
                  <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish (Español)</SelectItem>
                      <SelectItem value="Mandarin">Mandarin (中文)</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Research Interests & Baseline Health */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <HeartHandshake className="h-5 w-5 text-sky-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 3: Research Interests & Baseline Health</h2>
                  <p className="text-xs text-slate-500">Matching occurs without storing full electronic medical records.</p>
                </div>
              </div>

              {/* Healthy Volunteer Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div>
                  <Label htmlFor="healthy-switch" className="text-sm font-bold text-slate-900 cursor-pointer">
                    I consider myself a Healthy Volunteer
                  </Label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select this if you have no major chronic conditions and want to participate in control or biomarker studies for compensation.
                  </p>
                </div>
                <Switch 
                  id="healthy-switch"
                  checked={isHealthyVolunteer}
                  onCheckedChange={setIsHealthyVolunteer}
                />
              </div>

              {/* Diagnosed Conditions */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Conditions or Therapeutic Interests (Select all that apply)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Type 2 Diabetes", 
                    "Mild Cognitive Impairment", 
                    "Asthma / COPD", 
                    "Mild Hypertension", 
                    "Osteoarthritis", 
                    "Migraine", 
                    "Depression / Anxiety",
                    "Insomnia / Sleep Disorders",
                    "Eczema / Dermatology",
                    "Healthy Control Only"
                  ].map((cond) => {
                    const isSelected = selectedConditions.includes(cond);
                    return (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => toggleCondition(cond)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                          isSelected 
                            ? "bg-sky-600 text-white border-sky-600 shadow-xs" 
                            : "bg-white text-slate-700 border-slate-200 hover:border-sky-300"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {cond}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400">Optional. Only used to recommend specialized trials.</p>
              </div>

              {/* Preferred Study Types */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700">
                  Preferred Study Types
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "clinical_trial", label: "Interventional Clinical Trials" },
                    { id: "biomarker", label: "Blood / Biomarker Studies" },
                    { id: "survey", label: "Surveys & Questionnaires" },
                    { id: "device", label: "Digital Health & Wearables" },
                    { id: "longitudinal", label: "Long-term Observational" }
                  ].map((t) => {
                    const isSelected = preferredStudyTypes.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleStudyType(t.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                          isSelected 
                            ? "bg-slate-900 text-white border-slate-900" 
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lifestyle & Antibiotics Screeners */}
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
                  <span className="text-[10px] text-slate-400">Important for microbiome and metabolic studies.</span>
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
          )}

          {/* STEP 4: Logistics & Accessibility */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Car className="h-5 w-5 text-sky-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 4: Logistics, Transportation & Accessibility</h2>
                  <p className="text-xs text-slate-500">Ensure clinics provide travel stipends, accessible facilities, or ride services.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Transportation Method</Label>
                  <Select value={transportationAccess} onValueChange={(v: any) => setTransportationAccess(v)}>
                    <SelectTrigger className="text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal_vehicle">Own Personal Vehicle</SelectItem>
                      <SelectItem value="public_transit">Public Transit (Bus / Train)</SelectItem>
                      <SelectItem value="rideshare">Rideshare (Uber / Lyft / Taxi)</SelectItem>
                      <SelectItem value="needs_assistance">Requires Site-Provided Transport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Target Compensation Tier</Label>
                  <Input 
                    value={compensationExpectation}
                    onChange={(e) => setCompensationExpectation(e.target.value)}
                    placeholder="e.g. $200 - $800+"
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="accessibility" className="text-xs font-semibold text-slate-700">
                    Accessibility Needs or Physical Accommodations
                  </Label>
                  <Input 
                    id="accessibility"
                    placeholder="e.g. Wheelchair ramp, ground floor testing, large print consent"
                    value={accessibilityNeeds}
                    onChange={(e) => setAccessibilityNeeds(e.target.value)}
                    className="text-xs h-9"
                  />
                  <p className="text-[10px] text-slate-400">Helps sites arrange accommodations prior to your arrival.</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 sm:col-span-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="caregiver-switch" className="text-xs font-bold text-slate-800 cursor-pointer">
                        Caregiver Accompaniment Required
                      </Label>
                      <p className="text-[11px] text-slate-500">
                        Will you be accompanied by a family member or caregiver to study visits?
                      </p>
                    </div>
                    <Switch
                      id="caregiver-switch"
                      checked={caregiverRequired}
                      onCheckedChange={setCaregiverRequired}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <Label htmlFor="internet-switch" className="text-xs font-bold text-slate-800 cursor-pointer">
                        Reliable Home Internet Access
                      </Label>
                      <p className="text-[11px] text-slate-500">
                        Required for virtual visits and at-home electronic questionnaires.
                      </p>
                    </div>
                    <Switch
                      id="internet-switch"
                      checked={hasReliableInternet}
                      onCheckedChange={setHasReliableInternet}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <Label htmlFor="phone-switch" className="text-xs font-bold text-slate-800 cursor-pointer">
                        Active Smartphone (iOS or Android)
                      </Label>
                      <p className="text-[11px] text-slate-500">
                        Required if a study involves daily symptom logging or digital health apps.
                      </p>
                    </div>
                    <Switch
                      id="phone-switch"
                      checked={hasSmartphone}
                      onCheckedChange={setHasSmartphone}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Passport Quality Review & Missing Checklist */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
                <div>
                  <h2 className="text-base font-bold text-slate-900">Step 5: Passport Review & Quality Checklist</h2>
                  <p className="text-xs text-slate-500">A higher profile completion score unlocks priority review and better study matches.</p>
                </div>
              </div>

              {/* Completion Overview Card */}
              <div className="bg-gradient-to-br from-sky-50 to-indigo-50/40 border border-sky-200 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      <h3 className="font-extrabold text-slate-900 text-lg">
                        StudyLoop Research Passport
                      </h3>
                      <Badge className="bg-emerald-600 text-white text-[10px]">Verified Format</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Participant: <strong>{fullName || "Participant"}</strong> • {city}, {state} ({zipCode})
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-sky-700">
                      {completionData?.percentage || 90}%
                    </span>
                    <p className="text-[10px] text-slate-500 font-medium">Match Readiness</p>
                  </div>
                </div>
              </div>

              {/* Profile Completeness Checklist */}
              {completionData?.checklist && completionData.checklist.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Profile Quality Checklist
                  </h4>
                  <div className="space-y-2">
                    {completionData.checklist.map((item, idx) => (
                      <div 
                        key={idx}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                          item.completed 
                            ? "bg-emerald-50/50 border-emerald-200 text-emerald-950" 
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          {item.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-semibold">{item.label}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5">{item.why}</p>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-[10px] shrink-0 ${
                            item.completed ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-white text-slate-600"
                          }`}
                        >
                          {item.completed ? "Complete" : "Recommended"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-sky-600" />
                  Your StudyLoop Passport Data Guarantee:
                </p>
                <p>
                  Your profile is securely held on StudyLoop. It will never be sold to third-party data brokers or pharmaceutical advertisers. You can edit this information at any time.
                </p>
                <div className="pt-2">
                  <Link href="/settings/privacy-notifications" className="text-sky-600 hover:underline font-semibold flex items-center gap-1">
                    Manage Consent & Notification Preferences →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs h-9"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous Step
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {currentStep < 5 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-9 px-4"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  disabled={saveMutation.isPending}
                  onClick={handleSave}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-9 px-6 shadow-xs"
                >
                  {saveMutation.isPending ? "Saving Passport..." : "Save Passport & View My Studies"}
                  <Check className="h-4 w-4 ml-1.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
