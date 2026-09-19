import { useState, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  ShieldCheck, 
  Lock, 
  Bell, 
  Mail, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Info,
  HelpCircle,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function PrivacySettings() {
  const [profileKey, setProfileKey] = useState<string>("");

  useEffect(() => {
    const key = localStorage.getItem("studyloop_profile_key") || "demo_profile_rural_male";
    setProfileKey(key);
  }, []);

  const { data: consentData, isLoading, refetch } = trpc.consents.list.useQuery(
    { profileKey },
    { enabled: !!profileKey }
  );

  const updateMutation = trpc.consents.update.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Preferences updated", {
        description: "Your consent audit trail has been securely recorded."
      });
    },
    onError: (err) => {
      toast.error("Failed to update preference: " + err.message);
    }
  });

  type ConsentType = 
    | "terms_of_service" 
    | "privacy_policy" 
    | "matching_communications" 
    | "transactional_email" 
    | "marketing_email" 
    | "sms_opt_in";

  const getConsentState = (type: ConsentType, fallback = false): { granted: boolean; version: string } => {
    if (!consentData || !Array.isArray(consentData)) return { granted: fallback, version: "v1.0" };
    const found = consentData.find((c) => c.consentType === type);
    return found ? { granted: Boolean(found.isGranted), version: found.version || "v1.0" } : { granted: fallback, version: "v1.0" };
  };

  const handleToggle = (consentType: ConsentType, currentGranted: boolean, version: string) => {
    if (!profileKey) return;
    updateMutation.mutate({
      profileKey,
      consentType,
      isGranted: !currentGranted,
      version,
    });
  };

  const matchingConsent = getConsentState("matching_communications", true);
  const emailConsent = getConsentState("transactional_email", true);
  const smsConsent = getConsentState("sms_opt_in", false);
  const marketingConsent = getConsentState("marketing_email", false);
  const tosConsent = getConsentState("terms_of_service", true);
  const privacyConsent = getConsentState("privacy_policy", true);

  return (
    <div className="min-h-screen bg-slate-50/60 py-10">
      <div className="container max-w-4xl space-y-8">
        {/* Header Breadcrumb */}
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <Link href="/my-studies" className="hover:text-sky-600 transition-colors">My Studies</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Privacy & Notification Settings</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="h-7 w-7 text-sky-600" />
            Privacy, Consent & Notification Settings
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            You are always in control of your data. Manage essential study participation updates, research matching permissions, and marketing communication preferences.
          </p>
        </div>

        {/* Fundamental Trust Guarantee Alert */}
        <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 text-sky-950 flex items-start gap-4 shadow-xs">
          <Lock className="h-6 w-6 text-sky-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-sky-950">
              StudyLoop Participant Privacy Guarantee
            </h3>
            <p className="text-xs text-sky-800 leading-relaxed">
              Research matching consent is <strong>never permission to sell or rent your identifiable health data</strong>. 
              We only share study qualifications with research coordinators after you explicitly pass their study screener.
              Essential transactional updates regarding your applications are kept strictly distinct from non-essential promotional messages.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Study & Application Notifications */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Bell className="h-5 w-5 text-sky-600" />
                <span>Application & Study Updates</span>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Transactional alerts about studies you have applied to or are enrolled in.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="space-y-0.5 pr-3">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Mail className="h-4 w-4 text-sky-600" />
                    <span>Email Notifications</span>
                    <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-700 border-sky-200 py-0 px-1.5">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-slate-500">
                    Receive urgent status updates, next-action requests, and screening notifications.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Consent Policy {emailConsent.version}
                  </p>
                </div>
                <Switch
                  checked={emailConsent.granted}
                  onCheckedChange={() => handleToggle("transactional_email", emailConsent.granted, emailConsent.version)}
                  disabled={updateMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="space-y-0.5 pr-3">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <MessageSquare className="h-4 w-4 text-slate-500" />
                    <span>SMS Visit Reminders</span>
                    <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200 py-0 px-1.5">
                      Optional
                    </Badge>
                  </div>
                  <p className="text-slate-500">
                    Receive text message reminders 24 hours prior to scheduled clinic visits.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Consent Policy {smsConsent.version}
                  </p>
                </div>
                <Switch
                  checked={smsConsent.granted}
                  onCheckedChange={() => handleToggle("sms_opt_in", smsConsent.granted, smsConsent.version)}
                  disabled={updateMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Research Matching & Discovery */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span>Research Matching Engine</span>
              </div>
              <CardDescription className="text-xs text-slate-500">
                Permissions for our algorithm to match your profile with new clinical trials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="space-y-0.5 pr-3">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span>StudyLoop Passport Matching</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 py-0 px-1.5">
                      Active
                    </Badge>
                  </div>
                  <p className="text-slate-500">
                    Allow StudyLoop to evaluate your anonymous demographics & preferences to recommend new high-match studies.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Consent Policy {matchingConsent.version}
                  </p>
                </div>
                <Switch
                  checked={matchingConsent.granted}
                  onCheckedChange={() => handleToggle("matching_communications", matchingConsent.granted, matchingConsent.version)}
                  disabled={updateMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="space-y-0.5 pr-3">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <span>Research Newsletter & Tips</span>
                    <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200 py-0 px-1.5">
                      Non-essential
                    </Badge>
                  </div>
                  <p className="text-slate-500">
                    Receive periodic educational resources about clinical trial participation rights and wellness insights.
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Policy {marketingConsent.version}
                  </p>
                </div>
                <Switch
                  checked={marketingConsent.granted}
                  onCheckedChange={() => handleToggle("marketing_email", marketingConsent.granted, marketingConsent.version)}
                  disabled={updateMutation.isPending}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 3: Legal & Versioned Policies Audit Record */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <FileText className="h-5 w-5 text-slate-700" />
              <span>Versioned Legal Agreements & Audit Log</span>
            </div>
            <CardDescription className="text-xs text-slate-500">
              StudyLoop maintains an immutable timestamped log of each terms and privacy policy version you have agreed to.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <div className="bg-slate-100/70 px-4 py-2.5 font-semibold text-slate-700 grid grid-cols-12 gap-2">
                <span className="col-span-5">Agreement / Policy</span>
                <span className="col-span-3">Effective Version</span>
                <span className="col-span-4 text-right">Status & Timestamp</span>
              </div>
              <div className="divide-y divide-slate-100 bg-white">
                <div className="px-4 py-3 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">StudyLoop Terms of Service</p>
                      <Link href="/trust" className="text-sky-600 hover:underline text-[11px] flex items-center gap-1">
                        View document <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                  <div className="col-span-3 text-slate-600 font-mono">
                    {tosConsent.version}
                  </div>
                  <div className="col-span-4 text-right text-slate-500">
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                      Agreed
                    </span>
                  </div>
                </div>

                <div className="px-4 py-3 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">StudyLoop Participant Privacy Policy</p>
                      <Link href="/privacy" className="text-sky-600 hover:underline text-[11px] flex items-center gap-1">
                        View document <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                  <div className="col-span-3 text-slate-600 font-mono">
                    {privacyConsent.version}
                  </div>
                  <div className="col-span-4 text-right text-slate-500">
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                      Agreed
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support-managed Deletion / Export workflow */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-800">Data Access & Account Deletion Requests</p>
                <p className="text-slate-500">
                  Under our participant-first trust charter, you can request an export of your research history or submit a full profile deletion request.
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8 border-slate-300 hover:bg-white text-slate-700 shrink-0"
                onClick={() => toast.info("Support Request Received", {
                  description: "Our Privacy Officer will review your request within 24 hours."
                })}
              >
                Submit Data Request
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
