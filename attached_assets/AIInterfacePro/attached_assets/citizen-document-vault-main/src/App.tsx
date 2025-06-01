import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/DashboardPage";
import AadhaarPage from "./pages/AadhaarPage";
import PANPage from "./pages/PANPage";
import VoterIDPage from "./pages/VoterIDPage";
import DrivingLicensePage from "./pages/DrivingLicensePage";
import RationCardPage from "./pages/RationCardPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Index />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/aadhaar" 
        element={
          <ProtectedRoute>
            <AadhaarPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/pan" 
        element={
          <ProtectedRoute>
            <PANPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/voter-id" 
        element={
          <ProtectedRoute>
            <VoterIDPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/driving-license" 
        element={
          <ProtectedRoute>
            <DrivingLicensePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ration-card" 
        element={
          <ProtectedRoute>
            <RationCardPage />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
