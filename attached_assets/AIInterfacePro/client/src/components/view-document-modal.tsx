import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, FileText, Calendar, User, MapPin, Phone, Mail } from "lucide-react";

interface ViewDocumentModalProps {
  open: boolean;
  onClose: () => void;
  document: any;
  documentType: string;
}

export default function ViewDocumentModal({
  open,
  onClose,
  document,
  documentType,
}: ViewDocumentModalProps) {
  if (!document) return null;

  const getDocumentTitle = () => {
    const titles: { [key: string]: string } = {
      aadhaar: "Aadhaar Card",
      pan: "PAN Card",
      voterId: "Voter ID Card",
      drivingLicense: "Driving License",
      rationCard: "Ration Card",
    };
    return titles[documentType] || "Document";
  };

  const getDocumentNumber = () => {
    switch (documentType) {
      case "aadhaar":
        return document.aadhaarNumber;
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

  const handleDownload = () => {
    // Simulate PDF download
    const element = document.createElement("a");
    const file = new Blob([`${getDocumentTitle()} - ${document.name}\nDocument Number: ${getDocumentNumber()}`], {
      type: "text/plain",
    });
    element.href = URL.createObjectURL(file);
    element.download = `${documentType}_${document.name.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const renderDocumentSpecificFields = () => {
    switch (documentType) {
      case "aadhaar":
        return (
          <>
            <div className="info-row">
              <span className="info-label">Gender:</span>
              <span className="info-value">{document.gender || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Father's Name:</span>
              <span className="info-value">{document.fatherName || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{document.email || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Phone:</span>
              <span className="info-value">{document.phone || "N/A"}</span>
            </div>
          </>
        );
      
      case "pan":
        return (
          <div className="info-row">
            <span className="info-label">Father's Name:</span>
            <span className="info-value">{document.fatherName || "N/A"}</span>
          </div>
        );
      
      case "voterId":
        return (
          <>
            <div className="info-row">
              <span className="info-label">Gender:</span>
              <span className="info-value">{document.gender || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Father's Name:</span>
              <span className="info-value">{document.fatherName || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Constituency:</span>
              <span className="info-value">{document.constituency || "N/A"}</span>
            </div>
          </>
        );
      
      case "drivingLicense":
        return (
          <>
            <div className="info-row">
              <span className="info-label">Father's Name:</span>
              <span className="info-value">{document.fatherName || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Vehicle Class:</span>
              <span className="info-value">{document.vehicleClass || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Expiry Date:</span>
              <span className="info-value">{document.expiryDate || "N/A"}</span>
            </div>
          </>
        );
      
      case "rationCard":
        return (
          <>
            <div className="info-row">
              <span className="info-label">Family Members:</span>
              <span className="info-value">{document.familyMembers || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Category:</span>
              <span className="info-value">
                <Badge variant="secondary">{document.category || "N/A"}</Badge>
              </span>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            {getDocumentTitle()} Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{getDocumentTitle()}</CardTitle>
                <Badge className="status-verified">VERIFIED</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-2">
                  {getDocumentNumber()}
                </div>
                <div className="text-lg font-semibold">{document.name}</div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="info-row">
                <span className="info-label">Full Name:</span>
                <span className="info-value">{document.name}</span>
              </div>
              
              <div className="info-row">
                <span className="info-label">Date of Birth:</span>
                <span className="info-value">{document.dateOfBirth || "N/A"}</span>
              </div>

              {renderDocumentSpecificFields()}
            </CardContent>
          </Card>

          {/* Address Information */}
          {document.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="info-row">
                  <span className="info-label">Address:</span>
                  <span className="info-value">{document.address}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Document Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Document Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="info-row">
                <span className="info-label">Document Number:</span>
                <span className="info-value font-mono">{getDocumentNumber()}</span>
              </div>
              
              {document.issueDate && (
                <div className="info-row">
                  <span className="info-label">Issue Date:</span>
                  <span className="info-value">{document.issueDate}</span>
                </div>
              )}
              
              <div className="info-row">
                <span className="info-label">Last Updated:</span>
                <span className="info-value">{formatDate(document.lastUpdated)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button onClick={handleDownload} className="flex-1 government-button">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
