export interface DocumentStatus {
  status: "verified" | "pending" | "rejected";
  requestId?: string;
}

export interface DocumentCardData {
  type: string;
  title: string;
  number: string;
  name: string;
  lastUpdated: string;
  status: DocumentStatus;
  additionalInfo?: { [key: string]: string };
}

export interface FileUpload {
  file: File;
  name: string;
  type: string;
}

export interface ChangeRequestFormData {
  documentType: string;
  changeType: "minor" | "major";
  fieldToUpdate: string;
  newValue: string;
  supportingDocuments?: string[];
}
