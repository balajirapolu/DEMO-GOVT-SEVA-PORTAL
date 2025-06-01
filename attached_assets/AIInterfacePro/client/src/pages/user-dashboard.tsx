import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Edit, 
  Eye, 
  CreditCard, 
  Vote, 
  Car, 
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertCircle,
  Bell,
  LogOut
} from "lucide-react";
import Header from "@/components/Header";
import DocumentCard from "@/components/document-card";
import EditDocumentModal from "@/components/edit-document-modal";
import ViewDocumentModal from "@/components/view-document-modal";

export default function UserDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [viewModal, setViewModal] = useState({ open: false, document: null, type: "" });
  const [editModal, setEditModal] = useState({ open: false, document: null, type: "" });

  const { data: authData, isLoading: authLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  const { data: documentsData, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/user/documents"],
    enabled: !!authData?.user,
  });

  const { data: changeRequestsData } = useQuery({
    queryKey: ["/api/user/change-requests"],
    enabled: !!authData?.user,
  });

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

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'aadhaar': return CreditCard;
      case 'pan': return FileText;
      case 'voterId': return Vote;
      case 'drivingLicense': return Car;
      case 'rationCard': return ShoppingCart;
      default: return FileText;
    }
  };

  const getDocumentDisplayName = (type: string) => {
    switch (type) {
      case 'aadhaar': return 'Aadhaar Card';
      case 'pan': return 'PAN Card';
      case 'voterId': return 'Voter ID';
      case 'drivingLicense': return 'Driving License';
      case 'rationCard': return 'Ration Card';
      default: return type;
    }
  };

  const getDocumentStatus = (type: string) => {
    return "verified";
  };

  const handleViewDocument = (type: string, document: any) => {
    setViewModal({ open: true, document, type });
  };

  const handleEditDocument = (type: string, document: any) => {
    setEditModal({ open: true, document, type });
  };

  if (authLoading || documentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <Header user={authData?.user} userType="user" />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome, {authData?.user?.name}!
          </h1>
          <p className="text-gray-600">
            Manage your government documents and track change requests in one secure place.
          </p>
          {authData?.user?.aadhaarNumber && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-orange-600 text-white text-sm font-medium">
              Aadhaar: ****-****-{authData.user.aadhaarNumber.slice(-4)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Documents</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {documentsData?.documents ? Object.keys(documentsData.documents).length : 0}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Documents</p>
                  <p className="text-2xl font-bold text-green-600">
                    {documentsData?.documents ? Object.values(documentsData.documents).filter((doc: any) => doc).length : 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {changeRequestsData ? changeRequestsData.filter((req: any) => req.status === 'pending').length : 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Documents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documentsData?.documents && Object.entries(documentsData.documents).map(([type, document]: [string, any]) => {
              if (!document) return null;
              
              return (
                <DocumentCard
                  key={type}
                  document={document}
                  documentType={type}
                  title={getDocumentDisplayName(type)}
                  status={getDocumentStatus(type)}
                  onView={() => handleViewDocument(type, document)}
                  onEdit={() => handleEditDocument(type, document)}
                />
              );
            })}
          </div>
        </div>

        {changeRequestsData && Array.isArray(changeRequestsData) && changeRequestsData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Recent Change Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {changeRequestsData.slice(0, 3).map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {getDocumentDisplayName(request.documentType)} - {request.fieldToUpdate}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(request.submittedAt).toLocaleDateString()}
                        {request.referenceId && (
                          <span className="ml-2 text-orange-600">ID: {request.referenceId}</span>
                        )}
                      </p>
                    </div>
                    <Badge 
                      className={
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logout Section */}
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Session Management</h3>
                <p className="text-sm text-gray-600">Securely logout from your government portal session</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ViewDocumentModal
        open={viewModal.open}
        onClose={() => setViewModal({ open: false, document: null, type: "" })}
        document={viewModal.document}
        documentType={viewModal.type}
      />

      <EditDocumentModal
        open={editModal.open}
        onClose={() => setEditModal({ open: false, document: null, type: "" })}
        document={editModal.document}
        documentType={editModal.type}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/user/documents"] });
          queryClient.invalidateQueries({ queryKey: ["/api/user/change-requests"] });
          setEditModal({ open: false, document: null, type: "" });
        }}
      />
    </div>
  );
}