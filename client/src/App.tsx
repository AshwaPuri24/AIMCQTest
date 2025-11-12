import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import GenerateTest from "@/pages/GenerateTest";
import TakeTest from "@/pages/TakeTest";
import Results from "@/pages/Results";
import NotFound from "@/pages/not-found";
import Login from "./pages/Login";
import Register from "./pages/Register";

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
        <Route path="/pages" component={Dashboard} />
        <Route path="/generate" component={GenerateTest} />
        <Route path="/test/:attemptId" component={TakeTest} />
        <Route path="/results/:attemptId" component={Results} />
        <Route path="/login"><Redirect to="/" /></Route>
        <Route path="/register"><Redirect to="/" /></Route>
        <Route path="/landing"><Redirect to="/" /></Route>
        
        {/* Authenticated 404 */}
        <Route component={NotFound} /> 
      </Switch>
    );
  } else {
    // --- UNAUTHENTICATED ROUTES ---
    // User is not logged in. Show only public pages.
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/landing" component={Landing} />
        
        {/* Redirect all other paths to the landing page */}
        <Route path="/:rest*">
          <Redirect to="/landing" />
        </Route>
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