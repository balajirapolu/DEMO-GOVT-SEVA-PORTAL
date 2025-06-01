import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import "@/styles/global.css";

type AuthData = {
  type: "user" | "admin";
  user?: {
    id: number;
    name: string;
    aadhaar_number: string;
  };
  admin?: {
    id: number;
    name: string;
    employeeId: string;
  };
};

import LoginPage from "@/pages/login";
import UserDashboard from "@/pages/user-dashboard";
import AdminPanel from "@/pages/admin-panel";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/index";

function AuthWrapper() {
  const [location, setLocation] = useLocation();
  
  const { data: authData, isLoading } = useQuery<AuthData>({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && authData) {
      if (location === "/" || location === "/login") {
        if (authData.type === "user") {
          setLocation("/dashboard");
        } else if (authData.type === "admin") {
          setLocation("/admin");
        }
      }
    }
  }, [authData, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className="login-container flex items-center justify-center">
        <div className="login-card p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold mb-2 text-primary">Digital Document Services</h2>
          <p className="text-muted-foreground">Loading your secure portal...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard">
        {authData?.type === "user" ? <UserDashboard /> : <LoginPage />}
      </Route>
      <Route path="/admin">
        {authData?.type === "admin" ? <AdminPanel /> : <LoginPage />}
      </Route>
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
