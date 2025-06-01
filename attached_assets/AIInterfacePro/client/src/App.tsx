import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import LoginPage from "@/pages/login";
import UserDashboard from "@/pages/user-dashboard";
import AdminPanel from "@/pages/admin-panel";
import NotFound from "@/pages/not-found";

function AuthWrapper() {
  const [location, setLocation] = useLocation();
  
  const { data: authData, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading) {
      if (!authData && location !== "/") {
        setLocation("/");
      } else if (authData) {
        if (authData?.user && !location.startsWith("/dashboard")) {
          setLocation("/dashboard");
        } else if (authData?.admin && !location.startsWith("/admin")) {
          setLocation("/admin");
        }
      }
    }
  }, [authData, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Government Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/admin" component={AdminPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthWrapper />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
