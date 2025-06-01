import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, FileText } from "lucide-react";

interface DocumentCardProps {
  document: any;
  documentType: string;
  title: string;
  status: "verified" | "pending" | "rejected";
  onView: () => void;
  onEdit: () => void;
}

export default function DocumentCard({
  document,
  documentType,
  title,
  status,
  onView,
  onEdit,
}: DocumentCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="status-verified">VERIFIED</Badge>;
      case "pending":
        return <Badge className="status-pending">PENDING</Badge>;
      case "rejected":
        return <Badge className="status-rejected">REJECTED</Badge>;
      default:
        return <Badge className="status-verified">VERIFIED</Badge>;
    }
  };

  const getDocumentNumber = () => {
    switch (documentType) {
      case "aadhaar":
        return `****-****-${document.aadhaarNumber?.slice(-4)}`;
      case "pan":
        return document.panNumber;
      case "voterId":
        return document.voterIdNumber;
      case "drivingLicense":
        return document.licenseNumber;
      case "rationCard":
        return document.rationCardNumber;
      default:
        return "N/A";
    }
  };

  const getLastUpdated = () => {
    if (document.lastUpdated) {
      return new Date(document.lastUpdated).toLocaleDateString();
    }
    return "N/A";
  };

  return (
    <Card className="government-card cursor-pointer transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>
          {getStatusBadge(status)}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="info-row">
            <span className="info-label">Number:</span>
            <span className="info-value">{getDocumentNumber()}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Name:</span>
            <span className="info-value">{document.name}</span>
          </div>
          
          <div className="info-row">
            <span className="info-label">Last Updated:</span>
            <span className="info-value">{getLastUpdated()}</span>
          </div>
          
          {documentType === "drivingLicense" && document.expiryDate && (
            <div className="info-row">
              <span className="info-label">Expires:</span>
              <span className="info-value">{document.expiryDate}</span>
            </div>
          )}
          
          {documentType === "rationCard" && document.category && (
            <div className="info-row">
              <span className="info-label">Category:</span>
              <span className="info-value">{document.category}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={onView}
            className="flex-1 government-button"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
            disabled={status === "pending"}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
