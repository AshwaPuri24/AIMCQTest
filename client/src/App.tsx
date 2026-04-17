import { useEffect } from "react";
import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import GenerateTest from "@/pages/GenerateTest";
import TakeTest from "@/pages/TakeTest";
import Results from "@/pages/Results";
import NotFound from "@/pages/not-found";
import SSOCallback from "@/pages/SSOCallback";

/** Hard-redirects the browser to GradPlacifyr's login page. */
function GradPlacifyrRedirect() {
  useEffect(() => {
    window.location.href = import.meta.env.VITE_GRADPLACIFYR_LOGIN_URL;
  }, []);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/generate" component={GenerateTest} />
        <Route path="/test/:attemptId" component={TakeTest} />
        <Route path="/results/:attemptId" component={Results} />
        {/* If already logged in, /sso just goes home */}
        <Route path="/sso"><Redirect to="/" /></Route>

        {/* Authenticated 404 */}
        <Route component={NotFound} />
      </Switch>
    );
  } else {
    // --- UNAUTHENTICATED ROUTES ---
    // Only /sso is accessible; everything else sends the browser to GradPlacifyr.
    return (
      <Switch>
        <Route path="/sso" component={SSOCallback} />
        <Route component={GradPlacifyrRedirect} />
      </Switch>
    );
  }
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;