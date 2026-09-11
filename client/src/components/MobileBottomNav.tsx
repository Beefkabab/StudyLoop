import { Link, useLocation } from "wouter";
import { Compass, HeartHandshake, UserCircle2, Building2, Sparkles } from "lucide-react";

export function MobileBottomNav() {
  const [location] = useLocation();
  // Researcher portal uses its own compact mobile tab layout; the public participant routes get a direct phone navigation system.
  if (location.startsWith("/researchers") || location.startsWith("/for-institutions")) return null;

  const tabs = [
    { href: "/", icon: Compass, label: "Home", active: location === "/" },
    { href: "/browse", icon: Sparkles, label: "Explore", active: location === "/browse" || location.startsWith("/study/") },
    { href: "/dashboard", icon: HeartHandshake, label: "My Studies", active: location === "/dashboard" },
    { href: "/profile", icon: UserCircle2, label: "My Profile", active: location === "/profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-lg px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-6px_20px_rgba(15,23,42,0.08)]">
      <div className="grid grid-cols-4 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link key={tab.href} href={tab.href} className={`flex flex-col items-center gap-1 py-1 text-[10px] font-semibold transition-colors ${tab.active ? "text-sky-600" : "text-slate-500"}`}>
              <span className={`h-7 w-9 rounded-lg flex items-center justify-center transition-colors ${tab.active ? "bg-sky-100" : ""}`}><Icon className="h-4 w-4" /></span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
