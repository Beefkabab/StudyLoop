import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
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
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudyLoopLogo } from "@/components/StudyLoopLogo";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileKey, setProfileKey] = useState<string | null>(null);
  const [sessionUser, setSessionUser] = useState<{ name: string; username?: string; role?: string } | null>(null);

  useEffect(() => {
    const key = localStorage.getItem("studyloop_profile_key");
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

  const handleLogout = () => {
    localStorage.removeItem("studyloop_session_user");
    setSessionUser(null);
    setLocation("/");
  };

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
                MVP
              </Badge>
            </span>
            <span className="text-[11px] font-medium text-slate-500">Medical Research Marketplace</span>
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
            href="/how-it-works" 
            className={`transition-colors hover:text-sky-600 flex items-center gap-1.5 ${location === "/how-it-works" ? "text-sky-600 font-semibold" : ""}`}
          >
            <BookOpen className="h-4 w-4" />
            How It Works
          </Link>

          <Link 
            href="/faq" 
            className={`transition-colors hover:text-sky-600 flex items-center gap-1.5 ${location === "/faq" ? "text-sky-600 font-semibold" : ""}`}
          >
            <HelpCircle className="h-4 w-4" />
            FAQ
          </Link>

          <Link 
            href="/trust" 
            className={`transition-colors hover:text-sky-600 flex items-center gap-1.5 ${location === "/trust" ? "text-sky-600 font-semibold" : ""}`}
          >
            <ShieldCheck className="h-4 w-4" />
            Trust & Privacy
          </Link>

          <Link 
            href="/dashboard" 
            className={`transition-colors hover:text-sky-600 flex items-center gap-1.5 ${location === "/dashboard" ? "text-sky-600 font-semibold" : ""}`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Applications
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-2.5">
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
              {profileKey ? "Health Profile" : "Get Matched (Free)"}
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
            href="/how-it-works" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
          >
            <BookOpen className="h-4 w-4 text-slate-400" />
            How It Works
          </Link>
          <Link 
            href="/faq" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
          >
            <HelpCircle className="h-4 w-4 text-slate-400" />
            Frequently Asked Questions
          </Link>
          <Link 
            href="/trust" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
          >
            <ShieldCheck className="h-4 w-4 text-slate-400" />
            Trust, Security & Privacy
          </Link>
          <Link 
            href="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
          >
            <Info className="h-4 w-4 text-slate-400" />
            About StudyLoop
          </Link>
          <Link 
            href="/profile" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
          >
            <UserCircle2 className="h-4 w-4 text-slate-400" />
            Universal Health Profile
          </Link>
          <Link 
            href="/dashboard" 
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
          >
            <LayoutDashboard className="h-4 w-4 text-slate-400" />
            My Applications & Reminders
          </Link>
          
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full text-xs">
                Volunteer Sign In
              </Button>
            </Link>
            <Link href="/for-institutions" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-xs text-slate-600 hover:text-slate-900">
                <Building2 className="h-3.5 w-3.5 mr-1" />
                For Institutions & Sponsors
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
