
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, FileText, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RationCardCreationFormProps {
  onBack: () => void;
  onSave: (formData: Record<string, string>, files: { aadhaar: File | null, residency: File | null, income: File | null, birth: File | null }) => Promise<void>;
}

const RationCardCreationForm: React.FC<RationCardCreationFormProps> = ({
  onBack,
  onSave
}) => {
  const [formData, setFormData] = useState({
    headOfFamily: '',
    rationCardNumber: '',
    fpsId: '',
    fpsName: '',
    districtName: '',
    category: '',
    blockName: '',
    address: '',
    mobileNumber: '',
    email: '',
    aadhaarNumber: '',
    familyMembers: '',
    annualIncome: ''
  });
  const [files, setFiles] = useState({
    aadhaar: null as File | null,
    residency: null as File | null,
    income: null as File | null,
    birth: null as File | null
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (fileType: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFiles(prev => ({ ...prev, [fileType]: file }));
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file only.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const requiredFields = ['headOfFamily', 'districtName', 'category', 'blockName', 'address', 'mobileNumber', 'email', 'aadhaarNumber', 'familyMembers', 'annualIncome'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const requiredFiles = ['aadhaar', 'residency', 'income', 'birth'];
    const missingFiles = requiredFiles.filter(fileType => !files[fileType as keyof typeof files]);
    
    if (missingFiles.length > 0) {
      toast({
        title: "Missing Documents",
        description: `Please upload all required documents: ${missingFiles.join(', ')}.`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSave(formData, files);
      toast({
        title: "Ration Card Application Submitted",
        description: "Your Ration Card application has been submitted successfully."
      });
      onBack();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit Ration Card application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const FileUploadSection = ({ fileType, label, file }: { fileType: string, label: string, file: File | null }) => (
    <div className="space-y-2">
      <Label htmlFor={`${fileType}Pdf`}>{label} *</Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
        <input
          id={`${fileType}Pdf`}
          type="file"
          accept=".pdf"
          onChange={(e) => handleFileChange(fileType, e)}
          className="hidden"
        />
        <label htmlFor={`${fileType}Pdf`} className="cursor-pointer">
          <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">Click to upload {label}</p>
        </label>
        {file && (
          <div className="mt-2 flex items-center justify-center space-x-2 text-green-600">
            <FileText className="w-4 h-4" />
            <span className="text-sm">{file.name}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <CardTitle className="text-2xl">Create Ration Card Application</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please fill in all details as per your documents and upload all required certificates.
              </AlertDescription>
            </Alert>

            {/* Ration Card Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Ration Card Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="headOfFamily">Head of Family *</Label>
                  <Input
                    id="headOfFamily"
                    value={formData.headOfFamily}
                    onChange={(e) => handleInputChange('headOfFamily', e.target.value)}
                    placeholder="Head of family name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rationCardNumber">Ration Card Number</Label>
                  <Input
                    id="rationCardNumber"
                    value={formData.rationCardNumber}
                    onChange={(e) => handleInputChange('rationCardNumber', e.target.value)}
                    placeholder="Will be generated if new"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fpsId">FPS ID</Label>
                  <Input
                    id="fpsId"
                    value={formData.fpsId}
                    onChange={(e) => handleInputChange('fpsId', e.target.value)}
                    placeholder="Fair Price Shop ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fpsName">FPS Name</Label>
                  <Input
                    id="fpsName"
                    value={formData.fpsName}
                    onChange={(e) => handleInputChange('fpsName', e.target.value)}
                    placeholder="Fair Price Shop Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="districtName">District Name *</Label>
                  <Input
                    id="districtName"
                    value={formData.districtName}
                    onChange={(e) => handleInputChange('districtName', e.target.value)}
                    placeholder="Your district"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="blockName">Block Name *</Label>
                  <Input
                    id="blockName"
                    value={formData.blockName}
                    onChange={(e) => handleInputChange('blockName', e.target.value)}
                    placeholder="Your block/tehsil"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    placeholder="APL/BPL/AAY"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="familyMembers">Number of Family Members *</Label>
                  <Input
                    id="familyMembers"
                    type="number"
                    value={formData.familyMembers}
                    onChange={(e) => handleInputChange('familyMembers', e.target.value)}
                    placeholder="Total family members"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Personal Details Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number *</Label>
                  <Input
                    id="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={(e) => handleInputChange('aadhaarNumber', e.target.value)}
                    placeholder="1234 5678 9012"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                    placeholder="+91 9876543210"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="example@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="annualIncome">Annual Income *</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    value={formData.annualIncome}
                    onChange={(e) => handleInputChange('annualIncome', e.target.value)}
                    placeholder="Annual family income"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Complete address with pin code"
                  rows={3}
                  required
                />
              </div>
            </div>

            {/* Document Upload Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FileUploadSection fileType="aadhaar" label="Aadhaar Card PDF" file={files.aadhaar} />
                <FileUploadSection fileType="residency" label="Residency Certificate PDF" file={files.residency} />
                <FileUploadSection fileType="income" label="Income Certificate PDF" file={files.income} />
                <FileUploadSection fileType="birth" label="Birth Certificate PDF" file={files.birth} />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RationCardCreationForm;
