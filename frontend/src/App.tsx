import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import AssessmentDetail from "./pages/AssessmentDetail";
import EvidenceReports from "./pages/EvidenceReports";
import InstitutionalNetwork from "./pages/InstitutionalNetwork";
import LandingPage from "./pages/LandingPage";
import MyResearch from "./pages/MyResearch";
import NewAssessment from "./pages/NewAssessment";
import PatentGuidance from "./pages/PatentGuidance";
import WorkspaceOverview from "./pages/WorkspaceOverview";

function RouteMetadata() {
  const [location] = useLocation();
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Sanjeevani · Research intelligence",
      "/workspace": "Workspace overview · Sanjeevani",
      "/workspace/new": "New assessment · Sanjeevani",
      "/workspace/research": "My research · Sanjeevani",
      "/workspace/reports": "Evidence and reports · Sanjeevani",
      "/workspace/patent-guidance": "Patent guidance · Sanjeevani",
      "/workspace/network": "Institutional network · Sanjeevani",
    };
    document.title = titles[location] ?? (location.startsWith("/workspace/analysis/") ? "Analysis review · Sanjeevani" : "Page not found · Sanjeevani");
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement("link");
    canonical.rel = "canonical";
    canonical.href = new URL(location, window.location.origin).toString();
    if (!canonical.parentNode) document.head.appendChild(canonical);
  }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/workspace" component={WorkspaceOverview} />
      <Route path="/workspace/new" component={NewAssessment} />
      <Route path="/workspace/research" component={MyResearch} />
      <Route path="/workspace/analysis/:id" component={AssessmentDetail} />
      <Route path="/workspace/reports" component={EvidenceReports} />
      <Route path="/workspace/patent-guidance" component={PatentGuidance} />
      <Route path="/workspace/network" component={InstitutionalNetwork} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <RouteMetadata />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
