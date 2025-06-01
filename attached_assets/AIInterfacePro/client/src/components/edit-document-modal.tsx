import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X } from "lucide-react";

interface EditDocumentModalProps {
  open: boolean;
  onClose: () => void;
  document: any;
  documentType: string;
  onSuccess: () => void;
}

export default function EditDocumentModal({
  open,
  onClose,
  document,
  documentType,
  onSuccess,
}: EditDocumentModalProps) {
  const { toast } = useToast();
  
  const [changeType, setChangeType] = useState<"minor" | "major">("minor");
  const [fieldToUpdate, setFieldToUpdate] = useState("");
  const [newValue, setNewValue] = useState("");
  const [supportingFiles, setSupportingFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  const createRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/user/change-requests", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Request Submitted",
        description: changeType === "minor" 
          ? "Your change has been approved automatically."
          : `Your request has been submitted with reference ID: ${data.referenceId}`,
      });
      onSuccess();
      resetForm();
    },
    onError: (error: any) => {
      setError(error.message || "Failed to submit request");
    },
  });

  const resetForm = () => {
    setChangeType("minor");
    setFieldToUpdate("");
    setNewValue("");
    setSupportingFiles([]);
    setError("");
  };

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const getFieldOptions = () => {
    const commonFields = [
      { value: "name", label: "Name", type: "major" },
      { value: "address", label: "Address", type: "minor" },
      { value: "phone", label: "Phone Number", type: "minor" },
      { value: "dateOfBirth", label: "Date of Birth", type: "major" },
    ];

    switch (documentType) {
      case "aadhaar":
        return [
          ...commonFields,
          { value: "email", label: "Email", type: "minor" },
          { value: "fatherName", label: "Father's Name", type: "major" },
        ];
      case "pan":
        return [
          ...commonFields,
          { value: "fatherName", label: "Father's Name", type: "major" },
        ];
      case "voterId":
        return [
          ...commonFields,
          { value: "fatherName", label: "Father's Name", type: "major" },
          { value: "constituency", label: "Constituency", type: "minor" },
        ];
      case "drivingLicense":
        return [
          ...commonFields,
          { value: "fatherName", label: "Father's Name", type: "major" },
          { value: "vehicleClass", label: "Vehicle Class", type: "minor" },
        ];
      case "rationCard":
        return [
          { value: "name", label: "Name", type: "major" },
          { value: "address", label: "Address", type: "minor" },
          { value: "familyMembers", label: "Family Members", type: "minor" },
          { value: "category", label: "Category", type: "minor" },
        ];
      default:
        return commonFields;
    }
  };

  const handleFieldChange = (value: string) => {
    setFieldToUpdate(value);
    const field = getFieldOptions().find(f => f.value === value);
    if (field) {
      setChangeType(field.type as "minor" | "major");
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (supportingFiles.length + files.length > 2) {
      setError("You can upload maximum 2 supporting documents");
      return;
    }
    setSupportingFiles([...supportingFiles, ...files]);
    setError("");
  };

  const removeFile = (index: number) => {
    setSupportingFiles(supportingFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fieldToUpdate || !newValue.trim()) {
      setError("Please select a field and enter a new value");
      return;
    }

    if (changeType === "major" && supportingFiles.length < 2) {
      setError("Major changes require 2 supporting documents");
      return;
    }

    const supportingDocuments = supportingFiles.map(file => file.name);

    createRequestMutation.mutate({
      documentType,
      changeType,
      fieldToUpdate,
      newValue: newValue.trim(),
      supportingDocuments,
    });
  };

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit {getDocumentTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Card className={`p-4 cursor-pointer border-2 transition-colors ${
              changeType === "minor" ? "border-primary bg-primary/5" : "border-border"
            }`}>
              <div className="text-center">
                <h4 className="font-semibold mb-2">Minor Change</h4>
                <p className="text-sm text-muted-foreground">
                  Address, phone number - Auto approved
                </p>
              </div>
            </Card>

            <Card className={`p-4 cursor-pointer border-2 transition-colors ${
              changeType === "major" ? "border-primary bg-primary/5" : "border-border"
            }`}>
              <div className="text-center">
                <h4 className="font-semibold mb-2">Major Change</h4>
                <p className="text-sm text-muted-foreground">
                  Name, DOB, photo - Requires verification
                </p>
              </div>
            </Card>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field">Field to Update</Label>
            <Select value={fieldToUpdate} onValueChange={handleFieldChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select field to update" />
              </SelectTrigger>
              <SelectContent>
                {getFieldOptions().map((field) => (
                  <SelectItem key={field.value} value={field.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{field.label}</span>
                      <Badge variant={field.type === "major" ? "destructive" : "secondary"} className="ml-2">
                        {field.type}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newValue">New Value</Label>
            <Input
              id="newValue"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Enter new value"
            />
          </div>

          {changeType === "major" && (
            <div className="space-y-4">
              <Label>Supporting Documents (Required for major changes)</Label>
              
              <div className="file-upload-area">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="font-medium mb-2">Drop files here or click to upload</p>
                  <p className="text-sm text-muted-foreground">
                    Upload 2 supporting documents (PDF, JPG, PNG)
                  </p>
                </label>
              </div>

              {supportingFiles.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files ({supportingFiles.length}/2)</Label>
                  {supportingFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 government-button"
              disabled={createRequestMutation.isPending}
            >
              {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createRequestMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
