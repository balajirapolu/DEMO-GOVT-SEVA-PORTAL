
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DocumentCard from '@/components/DocumentCard';
import DocumentUpdateForm from '@/components/DocumentUpdateForm';
import DrivingLicenseCreationForm from '@/components/DrivingLicenseCreationForm';
import Header from '@/components/Header';

const DrivingLicensePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasDocument] = useState(false);

  const drivingLicenseData = {
    licenseNumber: 'DL123456789',
    fullName: 'John Doe',
    fatherName: 'Robert Doe',
    dateOfBirth: '01/01/1990',
    bloodGroup: 'A+',
    address: '123 Main Street, New Delhi, Delhi - 110001',
    licenseClass: 'Four Wheeler',
    validUpto: '31/12/2030',
    issueDate: '01/01/2020'
  };

  const documentFields = [
    { label: 'License Number', value: drivingLicenseData.licenseNumber, key: 'licenseNumber', editable: false },
    { label: 'Full Name', value: drivingLicenseData.fullName, key: 'fullName' },
    { label: 'Father\'s Name', value: drivingLicenseData.fatherName, key: 'fatherName' },
    { label: 'Date of Birth', value: drivingLicenseData.dateOfBirth, key: 'dateOfBirth', type: 'date' as const },
    { label: 'Blood Group', value: drivingLicenseData.bloodGroup, key: 'bloodGroup' },
    { label: 'Address', value: drivingLicenseData.address, key: 'address', type: 'textarea' as const },
    { label: 'License Class', value: drivingLicenseData.licenseClass, key: 'licenseClass' },
    { label: 'Valid Upto', value: drivingLicenseData.validUpto, key: 'validUpto', type: 'date' as const },
    { label: 'Issue Date', value: drivingLicenseData.issueDate, key: 'issueDate', type: 'date' as const, editable: false }
  ];

  const handleSave = async (updatedData: Record<string, string>) => {
    console.log('Saving Driving License data:', updatedData);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleCreate = async (formData: Record<string, string>, aadhaarFile: File | null, panFile: File | null) => {
    console.log('Creating Driving License with data:', formData);
    console.log('Aadhaar file:', aadhaarFile);
    console.log('PAN file:', panFile);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        {isCreating ? (
          <DrivingLicenseCreationForm
            onBack={() => setIsCreating(false)}
            onSave={handleCreate}
          />
        ) : isEditing ? (
          <DocumentUpdateForm
            documentType="Driving License"
            fields={documentFields}
            onBack={() => setIsEditing(false)}
            onSave={handleSave}
            userMobile={user?.aadhaarLinkedMobile || user?.mobileNumber || ''}
          />
        ) : (
          <DocumentCard
            documentType="Driving License"
            fields={documentFields}
            status="active"
            lastUpdated="2024-02-10"
            onEdit={() => setIsEditing(true)}
            hasDocument={hasDocument}
            onCreate={() => setIsCreating(true)}
            isAadhaar={false}
          />
        )}
      </div>
    </div>
  );
};

export default DrivingLicensePage;
