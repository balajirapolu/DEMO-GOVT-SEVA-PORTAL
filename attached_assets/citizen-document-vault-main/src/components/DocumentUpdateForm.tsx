
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import OTPModal from './OTPModal';

interface DocumentField {
  label: string;
  value: string;
  key: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea';
  editable?: boolean;
}

interface DocumentUpdateFormProps {
  documentType: string;
  fields: DocumentField[];
  onBack: () => void;
  onSave: (updatedFields: Record<string, string>) => Promise<void>;
  userMobile: string;
}

const DocumentUpdateForm: React.FC<DocumentUpdateFormProps> = ({
  documentType,
  fields,
  onBack,
  onSave,
  userMobile
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.key]: field.value }), {})
  );
  const [originalData] = useState<Record<string, string>>(
    fields.reduce((acc, field) => ({ ...acc, [field.key]: field.value }), {})
  );
  const [loading, setLoading] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [changeType, setChangeType] = useState<'minor' | 'major'>('minor');
  const [otpPurpose, setOtpPurpose] = useState('');

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const getChangedFields = () => {
    const changes: Record<string, string> = {};
    Object.keys(formData).forEach(key => {
      if (formData[key] !== originalData[key]) {
        changes[key] = formData[key];
      }
    });
    return changes;
  };

  const determineChangeType = (changes: Record<string, string>) => {
    const changedKeys = Object.keys(changes);
    
    // Define major change criteria
    const majorChangeFields = ['name', 'fullName', 'dateOfBirth', 'dob', 'fatherName', 'panNumber', 'aadhaarNumber'];
    const isMajorChange = changedKeys.some(key => 
      majorChangeFields.some(majorField => key.toLowerCase().includes(majorField.toLowerCase()))
    ) || changedKeys.length > 2;

    return isMajorChange ? 'major' : 'minor';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const changes = getChangedFields();
    if (Object.keys(changes).length === 0) {
      toast({
        title: "No Changes",
        description: "No changes were made to update.",
        variant: "destructive"
      });
      return;
    }

    const changeTypeDetected = determineChangeType(changes);
    setChangeType(changeTypeDetected);

    if (changeTypeDetected === 'minor') {
      // For minor changes, require OTP verification
      setOtpPurpose(`To verify minor changes to your ${documentType}`);
      setShowOTP(true);
    } else {
      // For major changes, submit change request
      await handleMajorChangeRequest(changes);
    }
  };

  const handleOTPVerification = async (otp: string) => {
    // Mock OTP verification - in real app, verify with backend
    if (otp === '123456') {
      await onSave(formData);
      toast({
        title: "Update Successful",
        description: `Your ${documentType} has been updated successfully.`
      });
      onBack();
    } else {
      throw new Error('Invalid OTP');
    }
  };

  const handleMajorChangeRequest = async (changes: Record<string, string>) => {
    setLoading(true);
    try {
      // Mock API call for major change request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Change Request Submitted",
        description: `Your major change request for ${documentType} has been submitted for admin approval.`
      });
      
      onBack();
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit change request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = Object.keys(getChangedFields()).length > 0;
  const changedFields = getChangedFields();
  const detectedChangeType = hasChanges ? determineChangeType(changedFields) : null;

  return (
    <>
      <div className="w-full max-w-2xl mx-auto space-y-6">
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
              <CardTitle className="text-2xl">Update {documentType}</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>{field.label}</Label>
                    {field.type === 'textarea' ? (
                      <Textarea
                        id={field.key}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        disabled={field.editable === false}
                        rows={3}
                      />
                    ) : (
                      <Input
                        id={field.key}
                        type={field.type || 'text'}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                        disabled={field.editable === false}
                      />
                    )}
                  </div>
                ))}
              </div>

              {hasChanges && (
                <>
                  <Separator />
                  <Alert className={detectedChangeType === 'major' ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Change Type: {detectedChangeType === 'major' ? 'Major' : 'Minor'}</strong>
                      <br />
                      {detectedChangeType === 'major' 
                        ? 'These changes require admin approval and will be submitted as a change request.'
                        : 'These changes can be processed immediately with OTP verification.'
                      }
                    </AlertDescription>
                  </Alert>
                </>
              )}

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={!hasChanges || loading}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {loading ? 'Submitting...' : 
                   detectedChangeType === 'major' ? 'Submit Change Request' : 'Update with OTP'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <OTPModal
        isOpen={showOTP}
        onClose={() => setShowOTP(false)}
        onVerify={handleOTPVerification}
        phoneNumber={userMobile}
        purpose={otpPurpose}
      />
    </>
  );
};

export default DocumentUpdateForm;
