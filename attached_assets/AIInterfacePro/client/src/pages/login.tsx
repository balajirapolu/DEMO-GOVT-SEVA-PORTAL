import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [userForm, setUserForm] = useState({ aadhaarNumber: "" });
  const [adminForm, setAdminForm] = useState({ employeeId: "", password: "" });
  const [error, setError] = useState("");

  const userLoginMutation = useMutation({
    mutationFn: async (data: { aadhaarNumber: string }) => {
      const response = await apiRequest("POST", "/api/auth/user/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], { type: "user", user: data.user });
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.name}!`,
      });
      setLocation("/dashboard");
    },
    onError: (error: any) => {
      setError(error.message || "Login failed");
    },
  });

  const adminLoginMutation = useMutation({
    mutationFn: async (data: { employeeId: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/admin/login", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/me"], { type: "admin", admin: data.admin });
      toast({
        title: "Admin Login Successful",
        description: `Welcome, ${data.admin.name}!`,
      });
      setLocation("/admin");
    },
    onError: (error: any) => {
      setError(error.message || "Login failed");
    },
  });

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!userForm.aadhaarNumber || userForm.aadhaarNumber.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number");
      return;
    }
    
    userLoginMutation.mutate(userForm);
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!adminForm.employeeId || !adminForm.password) {
      setError("Please enter both Employee ID and password");
      return;
    }
    
    adminLoginMutation.mutate(adminForm);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold">
              🏛️
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-primary">Government Portal</h1>
              <p className="text-sm text-muted-foreground">Secure Document Management</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user">User Login</TabsTrigger>
              <TabsTrigger value="admin">Admin Login</TabsTrigger>
            </TabsList>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <TabsContent value="user">
              <form onSubmit={handleUserLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Aadhaar Number</Label>
                  <Input
                    id="aadhaar"
                    type="text"
                    placeholder="Enter 12-digit Aadhaar number"
                    maxLength={12}
                    value={userForm.aadhaarNumber}
                    onChange={(e) => setUserForm({ ...userForm, aadhaarNumber: e.target.value })}
                    className="text-center tracking-wider"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full government-button"
                  disabled={userLoginMutation.isPending}
                >
                  {userLoginMutation.isPending ? "Logging in..." : "Login to Portal"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="employeeId">Government Employee ID</Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="Enter Government ID"
                    value={adminForm.employeeId}
                    onChange={(e) => setAdminForm({ ...adminForm, employeeId: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full government-button"
                  disabled={adminLoginMutation.isPending}
                >
                  {adminLoginMutation.isPending ? "Logging in..." : "Login to Admin Panel"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
            <p className="font-medium mb-2">Demo Credentials:</p>
            <p>User: 123456789012</p>
            <p>Admin: GOV001 / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
