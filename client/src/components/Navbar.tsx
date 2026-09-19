import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { 
  HeartHandshake, 
  Sparkles, 
  BriefcaseMedical, 
  UserCircle2, 
  Building2, 
  Search, 
  ArrowRight,
  ShieldCheck, 
  Menu, 
  X, 
  LogIn, 
  LayoutDashboard, 
  LogOut, 
  HelpCircle, 
  BookOpen, 
  Info,
  Bell,
  CheckCircle2,
  AlertCircle,
  Settings,
  ShieldAlert,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudyLoopLogo } from "@/components/StudyLoopLogo";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileKey, setProfileKey] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<{ name: string; username?: string; role?: string } | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("studyloop_profile_key") || "demo_profile_rural_male";
    setProfileKey(key);
    const userJson = localStorage.getItem("studyloop_session_user");
    if (userJson) {
      try {
        setSessionUser(JSON.parse(userJson));
      } catch {
        setSessionUser(null);
      }
    } else {
      setSessionUser(null);
    }
  }, [location]);

  const effectiveKey = profileKey || "demo_profile_rural_male";

  const { data: notifData, refetch: refetchNotifs } = trpc.notifications.list.useQuery(
    { profileKey: effectiveKey },
    { enabled: true }
  );

  const { data: unreadData, refetch: refetchUnread } = trpc.notifications.unreadCount.useQuery(
    { profileKey: effectiveKey },
    { enabled: true }
  );

  const markAllMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      refetchNotifs();
      refetchUnread();
      toast.success("All notifications marked as read");
    }
  });

  const handleLogout = () => {
    localStorage.removeItem("studyloop_session_user");
    setSessionUser(null);
    setLocation("/");
  };

  const unreadCount = typeof unreadData === "number" ? unreadData : 0;
  const notifications = Array.isArray(notifData) ? notifData : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-white/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg md:text-xl text-slate-900 group shrink-0">
          <StudyLoopLogo size={40} rounded="xl" />
          <div className="flex flex-col">
            <span className="leading-tight flex items-center gap-1.5 font-extrabold text-slate-900 tracking-tight">
              StudyLoop
              <Badge variant="outline" className="text-[10px] font-semibold text-sky-700 bg-sky-50 border-sky-200 py-0 px-1.5 h-4">
                Platform
              </Badge>
            </span>
            <span className="text-[11px] font-medium text-slate-500">Participant Lifecycle Platform</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600">
          <Link 
            href="/browse" 
            className={`transition-colors hover:text-sky-600 flex items-center gap-1.5 ${location === "/browse" ? "text-sky-600 font-semibold" : ""}`}
          >
            <Search className="h-4 w-4" />
            Explore Studies
          </Link>

          <Link 
            href="/my-studies" 
            className={`transition-colors hover:text-sky-600 flex items-center gap-1.5 ${location === "/my-studies" || location === "/dashboard" ? "text-sky-600 font-semibold" : ""}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            My Studies
          </Link>

          <Link 
            href="/how-it-works" 
            className={`transition-colors hover:text-sky-600 flex items-center gap-1.5 ${location === "/how-it-works" ? "text-sky-600 font-semibold" : ""}`}
          >
            <BookOpen className="h-4 w-4" />
            How It Works
          </Link>

          <Link 
            href="/trust" 
            className={`transition-colors hover:text-sky-600 flex items-center gap-1.5 ${location === "/trust" ? "text-sky-600 font-semibold" : ""}`}
          >
            <ShieldCheck className="h-4 w-4" />
            Trust & Privacy
          </Link>

          <Link 
            href="/admin" 
            className={`transition-colors hover:text-indigo-600 flex items-center gap-1.5 ${location === "/admin" ? "text-indigo-600 font-semibold" : "text-slate-500"}`}
            title="StudyLoop Internal Operations & Audit"
          >
            <ShieldAlert className="h-4 w-4 text-indigo-500" />
            Ops Admin
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Notification Bell Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-9 w-9 p-0 rounded-full"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 shadow-lg border-slate-200" align="end">
              <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-sky-600" />
                  <span className="font-bold text-xs text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllMutation.mutate({ profileKey: effectiveKey })}
                    className="text-[11px] text-sky-600 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 space-y-1">
                    <p className="font-medium">No new notifications</p>
                    <p className="text-[11px]">Updates on your applications will appear here.</p>
                  </div>
                ) : (
                  notifications.map((notif: any) => (
                    <div 
                      key={notif.id}
                      className={`p-3.5 transition-colors hover:bg-slate-50 ${
                        !notif.isRead ? "bg-sky-50/30 font-medium" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-slate-900 text-xs">{notif.title}</p>
                        {!notif.isRead && (
                          <span className="h-2 w-2 rounded-full bg-sky-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      {notif.actionUrl && (
                        <div className="mt-2">
                          <Link 
                            href={notif.actionUrl}
                            className="text-sky-600 hover:underline text-[11px] font-semibold inline-flex items-center gap-1"
                          >
                            View details <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <Link 
                  href="/my-studies" 
                  className="text-[11px] text-slate-600 hover:text-sky-600 font-semibold"
                >
                  View My Studies Dashboard →
                </Link>
              </div>
            </PopoverContent>
          </Popover>

          {/* Privacy & Notifications Settings */}
          <Link 
            href="/settings/privacy-notifications" 
            className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Privacy & Notification Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>

          {sessionUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 py-1 px-2.5 rounded-lg">
                {sessionUser.name}
              </span>
              {sessionUser.role === "researcher" ? (
                <Link href="/researchers">
                  <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8">
                    PI Workspace
                  </Button>
                </Link>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-red-600 h-8 px-2"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link 
                href="/for-institutions" 
                className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                <span>For Institutions</span>
              </Link>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-slate-600 h-8">
                  <LogIn className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  Sign In
                </Button>
              </Link>
            </div>
          )}

          <Link href="/profile">
            <Button 
              size="sm" 
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-medium rounded-lg text-xs flex items-center gap-1.5 h-8"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Research Passport
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-white px-4 py-4 space-y-2.5">
          <Link 
            href="/browse" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
          >
            <Search className="h-4 w-4 text-sky-600" />
            Explore Studies
          </Link>
          <Link 
            href="/my-studies" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
          >
            <LayoutDashboard className="h-4 w-4 text-sky-600" />
            My Studies Dashboard
          </Link>
          <Link 
            href="/profile" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
          >
            <UserCircle2 className="h-4 w-4 text-slate-400" />
            StudyLoop Passport
          </Link>
          <Link 
            href="/settings/privacy-notifications" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            Privacy & Notification Preferences
          </Link>
          <Link 
            href="/how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
          >
            <BookOpen className="h-4 w-4 text-slate-400" />
            How It Works
          </Link>
          <Link 
            href="/admin" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-indigo-700 hover:text-indigo-800"
          >
            <ShieldAlert className="h-4 w-4 text-indigo-600" />
            Internal Ops Admin
          </Link>
          <Link 
            href="/trust" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
          >
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            Trust, Security & Privacy
          </Link>
          
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full text-xs">
                Volunteer Sign In
              </Button>
            </Link>
            <Link href="/researchers" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-xs text-slate-600 hover:text-slate-900">
                <Building2 className="h-3.5 w-3.5 mr-1" />
                Researcher Workspace
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-14 text-slate-600 text-sm">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <StudyLoopLogo size={32} rounded="lg" />
            StudyLoop
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            A consumer-first marketplace connecting human volunteers with compensated clinical trials, surveys, and medical research.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            IRB-Approved protocols & HIPAA compliant safeguards
          </div>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">For Participants</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/browse" className="hover:text-sky-600 transition-colors">Browse Paid Studies</Link></li>
            <li><Link href="/how-it-works" className="hover:text-sky-600 transition-colors">How StudyLoop Works</Link></li>
            <li><Link href="/faq" className="hover:text-sky-600 transition-colors">Frequently Asked Questions</Link></li>
            <li><Link href="/profile" className="hover:text-sky-600 transition-colors">Create Universal Profile</Link></li>
            <li><Link href="/dashboard" className="hover:text-sky-600 transition-colors">My Applications & Visits</Link></li>
            <li><Link href="/login" className="hover:text-sky-600 transition-colors">Participant Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">For Research Teams</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/researchers" className="hover:text-sky-600 transition-colors">Qualified Candidate Pipeline</Link></li>
            <li><Link href="/for-institutions" className="hover:text-sky-600 transition-colors">Institutional Solutions</Link></li>
            <li><Link href="/researchers" className="hover:text-sky-600 transition-colors">Demographic Diversity Tools</Link></li>
            <li><Link href="/institution/login" className="hover:text-sky-600 transition-colors">Coordinator Portal Login</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">Trust & Company</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/trust" className="hover:text-sky-600 transition-colors">Trust & Privacy Center</Link></li>
            <li><Link href="/trust" className="hover:text-sky-600 transition-colors">The Participant Bill of Rights</Link></li>
            <li><Link href="/about" className="hover:text-sky-600 transition-colors">About StudyLoop & Mission</Link></li>
            <li><Link href="/how-it-works" className="hover:text-sky-600 transition-colors">Clinical Visit Guide</Link></li>
          </ul>
          <div className="mt-4 p-3 bg-sky-50 border border-sky-100 rounded-xl text-[11px] text-sky-800 leading-relaxed font-medium">
            Demo research marketplace demonstrating personalized medical research discovery.
          </div>
        </div>
      </div>
      <div className="container mt-10 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-2">
        <p>© 2026 StudyLoop Inc. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <Link href="/trust" className="hover:text-slate-600">Privacy Policy</Link>
          <Link href="/trust" className="hover:text-slate-600">Terms & Patient Rights</Link>
          <Link href="/faq" className="hover:text-slate-600">Support</Link>
        </div>
      </div>
    </footer>
  );
}
