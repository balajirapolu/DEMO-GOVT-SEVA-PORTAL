import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { 
  LogOut, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Users, 
  FileText, 
  Clock,
  CreditCard,
  Vote,
  Car,
  ShoppingCart,
  User,
  Phone,
  MapPin,
  Calendar,
  Download,
  Search
} from "lucide-react";
import Header from "@/components/Header";

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [comments, setComments] = useState("");
  const [userDocuments, setUserDocuments] = useState<any>(null);

  const { data: authData } = useQuery({
    queryKey: ["/api/auth/me"],
  });

  const { data: requests, isLoading, refetch } = useQuery({
    queryKey: ["/api/admin/change-requests"],
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, comments }: { id: number; comments: string }) => {
      const response = await apiRequest("POST", `/api/admin/change-requests/${id}/approve`, { comments });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Approved & Documents Updated",
        description: "The change request has been approved and all user documents have been synchronized.",
      });
      refetch();
      setReviewModalOpen(false);
      setComments("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, comments }: { id: number; comments: string }) => {
      const response = await apiRequest("POST", `/api/admin/change-requests/${id}/reject`, { comments });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request Rejected",
        description: "The change request has been rejected.",
      });
      refetch();
      setReviewModalOpen(false);
      setComments("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const fetchUserDocuments = async (userId: number) => {
    try {
      const response = await apiRequest("GET", `/api/admin/users/${userId}/documents`);
      const data = await response.json();
      setUserDocuments(data);
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user documents",
        variant: "destructive",
      });
    }
  };

  const handleViewUserDocuments = async (request: any) => {
    setSelectedUser({
      id: request.userId,
      name: request.userName || `User ${request.userId}`,
      request: request
    });
    await fetchUserDocuments(request.userId);
    setDocumentsModalOpen(true);
  };

  const handleReviewRequest = (request: any) => {
    setSelectedRequest(request);
    setReviewModalOpen(true);
  };

  const handleApprove = () => {
    if (selectedRequest) {
      approveMutation.mutate({ id: selectedRequest.id, comments });
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      rejectMutation.mutate({ id: selectedRequest.id, comments });
    }
  };

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

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout");
      queryClient.clear();
      window.location.href = "/";
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
        <Header admin={authData?.admin} userType="admin" />
        <div className="container mx-auto p-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50">
      <Header admin={authData?.admin} userType="admin" />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 border border-red-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <Users className="w-8 h-8 mr-3 text-red-600" />
            Admin Control Panel
          </h1>
          <p className="text-gray-600">
            Review and manage citizen document change requests with comprehensive verification tools.
          </p>
          {authData?.admin && (
            <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-red-600 text-white text-sm font-medium">
              Officer: {authData.admin.name} | ID: {authData.admin.employeeId}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Array.isArray(requests) ? requests.length : 0}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {Array.isArray(requests) ? requests.filter((req: any) => req.status === 'pending').length : 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Processed Today</p>
                  <p className="text-2xl font-bold text-green-600">0</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Change Requests Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Array.isArray(requests) && requests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Change Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request: any) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-mono text-sm">
                        {request.referenceId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.userName}</p>
                          <p className="text-xs text-gray-500">****-****-{request.userAadhaar?.slice(-4)}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {(() => {
                            const IconComponent = getDocumentIcon(request.documentType);
                            return <IconComponent className="w-4 h-4 mr-2 text-orange-600" />;
                          })()}
                          {getDocumentDisplayName(request.documentType)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{request.fieldToUpdate}</p>
                          <p className="text-xs text-gray-500">
                            {request.oldValue} → {request.newValue}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={request.changeType === 'major' ? 'destructive' : 'default'}>
                          {request.changeType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {request.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(request.submittedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUserDocuments(request)}
                          >
                            <Search className="w-4 h-4 mr-1" />
                            View Docs
                          </Button>
                          {request.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReviewRequest(request)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No change requests found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Admin Session</h3>
                <p className="text-sm text-gray-600">Securely logout from admin panel</p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Modal */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Change Request</DialogTitle>
            <DialogDescription>
              Review the details and approve or reject this change request
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500">Reference ID</Label>
                  <p className="font-mono text-sm">{selectedRequest.referenceId}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Document Type</Label>
                  <p className="font-medium">{getDocumentDisplayName(selectedRequest.documentType)}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Field to Update</Label>
                  <p className="font-medium">{selectedRequest.fieldToUpdate}</p>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Change Type</Label>
                  <Badge variant={selectedRequest.changeType === 'major' ? 'destructive' : 'default'}>
                    {selectedRequest.changeType}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Change Details</Label>
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-xs text-gray-500">Current Value</Label>
                    <p className="font-medium">{selectedRequest.oldValue || 'Not set'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">New Value</Label>
                    <p className="font-medium">{selectedRequest.newValue}</p>
                  </div>
                </div>
              </div>

              {selectedRequest.supportingDocuments && selectedRequest.supportingDocuments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Supporting Documents</Label>
                  <div className="space-y-2">
                    {selectedRequest.supportingDocuments.map((doc: string, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        <FileText className="w-4 h-4" />
                        <span className="text-sm">{doc}</span>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="comments">Admin Comments</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add your review comments here..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {approveMutation.isPending ? "Approving..." : "Approve & Update Documents"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {rejectMutation.isPending ? "Rejecting..." : "Reject Request"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Documents Modal */}
      <Dialog open={documentsModalOpen} onOpenChange={setDocumentsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>User Document Portfolio</DialogTitle>
            <DialogDescription>
              Complete document overview for {selectedUser?.name}
            </DialogDescription>
          </DialogHeader>
          
          {userDocuments && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="documents">All Documents</TabsTrigger>
                <TabsTrigger value="request">Current Request</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">User Name</Label>
                    <p className="font-medium">{userDocuments.user?.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Aadhaar Number</Label>
                    <p className="font-mono">****-****-{userDocuments.user?.aadhaarNumber?.slice(-4)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(userDocuments).filter(([key]) => key !== 'user').map(([type, doc]: [string, any]) => {
                    if (!doc) return null;
                    
                    const IconComponent = getDocumentIcon(type);
                    return (
                      <Card key={type}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <IconComponent className="w-5 h-5 mr-2 text-orange-600" />
                              <span className="font-medium">{getDocumentDisplayName(type)}</span>
                            </div>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            Last updated: {new Date(doc.lastUpdated).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                {Object.entries(userDocuments).filter(([key]) => key !== 'user').map(([type, doc]: [string, any]) => {
                  if (!doc) return null;
                  
                  return (
                    <Card key={type}>
                      <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                          {(() => {
                            const IconComponent = getDocumentIcon(type);
                            return <IconComponent className="w-5 h-5 mr-2 text-orange-600" />;
                          })()}
                          {getDocumentDisplayName(type)}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(doc).filter(([key]) => !['id', 'userId', 'lastUpdated'].includes(key)).map(([key, value]: [string, any]) => (
                            <div key={key}>
                              <Label className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                              <p className="font-medium">{String(value)}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
              
              <TabsContent value="request" className="space-y-4">
                {selectedUser?.request && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Change Request Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-500">Reference ID</Label>
                          <p className="font-mono">{selectedUser.request.referenceId}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Document Type</Label>
                          <p className="font-medium">{getDocumentDisplayName(selectedUser.request.documentType)}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Field to Update</Label>
                          <p className="font-medium">{selectedUser.request.fieldToUpdate}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Change Type</Label>
                          <Badge variant={selectedUser.request.changeType === 'major' ? 'destructive' : 'default'}>
                            {selectedUser.request.changeType}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Current Value</Label>
                          <p className="font-medium">{selectedUser.request.oldValue || 'Not set'}</p>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-500">Requested Value</Label>
                          <p className="font-medium">{selectedUser.request.newValue}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}