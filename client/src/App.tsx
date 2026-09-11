import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar, Footer } from "@/components/Navbar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import NotFound from "@/pages/NotFound";
import BrowseStudies from "@/pages/BrowseStudies";
import ForInstitutions from "@/pages/ForInstitutions";
import Home from "@/pages/Home";
import ResearcherPortal from "@/pages/ResearcherPortal";
import StudyDetail from "@/pages/StudyDetail";
import UniversalProfile from "@/pages/UniversalProfile";
import ParticipantDashboard from "@/pages/ParticipantDashboard";
import Login from "@/pages/Login";
import InstitutionLogin from "@/pages/InstitutionLogin";
import HowItWorks from "@/pages/HowItWorks";
import FAQ from "@/pages/FAQ";
import TrustPrivacy from "@/pages/TrustPrivacy";
import AboutUs from "@/pages/AboutUs";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse" component={BrowseStudies} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/faq" component={FAQ} />
      <Route path="/trust" component={TrustPrivacy} />
      <Route path="/privacy" component={TrustPrivacy} />
      <Route path="/about" component={AboutUs} />
      <Route path="/about-us" component={AboutUs} />
      <Route path="/profile" component={UniversalProfile} />
      <Route path="/dashboard" component={ParticipantDashboard} />
      <Route path="/login" component={Login} />
      <Route path="/institution/login" component={InstitutionLogin} />
      <Route path="/institution-login" component={InstitutionLogin} />
      <Route path="/researchers/login" component={InstitutionLogin} />
      <Route path="/study/:slug" component={StudyDetail} />
      <Route path="/researchers" component={ResearcherPortal} />
      <Route path="/for-institutions" component={ForInstitutions} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppShell() {
  const [location] = useLocation();
  const isInstitutionalRoute = location.startsWith("/researchers") || location.startsWith("/institution");

  return (
    <div className="min-h-screen flex flex-col">
      {!isInstitutionalRoute && <Navbar />}
      <main className="flex-1">
        <Router />
      </main>
      {!isInstitutionalRoute && <Footer />}
      {!isInstitutionalRoute && <MobileBottomNav />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <AppShell />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
