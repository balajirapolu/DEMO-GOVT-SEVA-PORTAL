import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  LogOut, 
  Settings, 
  User,
  Shield,
  Bell
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import "@/styles/global.css";

interface HeaderProps {
  user?: any;
  admin?: any;
  userType: "user" | "admin";
}

export default function Header({ user, admin, userType }: HeaderProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", "POST"),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
      toast({
        title: "Logged out successfully",
        description: "You have been securely logged out.",
      });
    },
  });

  const currentUser = user || admin;
  const displayName = currentUser?.name || "Government User";
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase();

  return (
    <header className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Digital Document Services</h1>
                <p className="text-sm opacity-80">Government of India</p>
              </div>
            </div>
          </div>

          {/* Navigation and User Menu */}
          <div className="flex items-center space-x-4">
            {/* User Type Badge */}
            <Badge variant="secondary" className="hidden sm:flex bg-white/10 hover:bg-white/20 text-white border-0">
              {userType === "admin" ? (
                <>
                  <Shield className="w-3 h-3 mr-1" />
                  Administrator
                </>
              ) : (
                <>
                  <User className="w-3 h-3 mr-1" />
                  Citizen Portal
                </>
              )}
            </Badge>

            {/* Notifications (placeholder) */}
            <Button variant="ghost" size="sm" className="relative text-white hover:bg-white/10">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full"></span>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-white/10 text-white text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" forceMount>
                <div className="flex items-center justify-start gap-3 p-3 bg-primary/5">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-white text-sm font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{displayName}</p>
                    {userType === "user" && user?.aadhaarNumber && (
                      <p className="text-xs text-muted-foreground">
                        Aadhaar: ****-****-{user.aadhaarNumber.slice(-4)}
                      </p>
                    )}
                    {userType === "admin" && admin?.employeeId && (
                      <p className="text-xs text-muted-foreground">
                        Employee ID: {admin.employeeId}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-2">
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 py-2"
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}