
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DocumentCard from '@/components/DocumentCard';
import DocumentUpdateForm from '@/components/DocumentUpdateForm';
import PANCreationForm from '@/components/PANCreationForm';
import Header from '@/components/Header';

const PANPage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasDocument] = useState(false); // Set to false to show creation flow

  // Mock PAN data
  const panData = {
    panNumber: 'ABCDE1234F',
    fullName: 'John Doe',
    fatherName: 'Robert Doe',
    dateOfBirth: '01/01/1990',
    address: '123 Main Street, New Delhi, Delhi - 110001',
    mobileNumber: '+91 9876543210',
    email: 'john.doe@email.com'
  };

  const documentFields = [
    { label: 'PAN Number', value: panData.panNumber, key: 'panNumber', editable: false },
    { label: 'Full Name', value: panData.fullName, key: 'fullName' },
    { label: 'Father\'s Name', value: panData.fatherName, key: 'fatherName' },
    { label: 'Date of Birth', value: panData.dateOfBirth, key: 'dateOfBirth', type: 'date' as const },
    { label: 'Address', value: panData.address, key: 'address', type: 'textarea' as const },
    { label: 'Mobile Number', value: panData.mobileNumber, key: 'mobileNumber', type: 'tel' as const },
    { label: 'Email', value: panData.email, key: 'email', type: 'email' as const }
  ];

  const handleSave = async (updatedData: Record<string, string>) => {
    console.log('Saving PAN data:', updatedData);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleCreate = async (formData: Record<string, string>, aadhaarFile: File | null) => {
    console.log('Creating PAN with data:', formData);
    console.log('Aadhaar file:', aadhaarFile);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        {isCreating ? (
          <PANCreationForm
            onBack={() => setIsCreating(false)}
            onSave={handleCreate}
          />
        ) : isEditing ? (
          <DocumentUpdateForm
            documentType="PAN Card"
            fields={documentFields}
            onBack={() => setIsEditing(false)}
            onSave={handleSave}
            userMobile={user?.aadhaarLinkedMobile || user?.mobileNumber || ''}
          />
        ) : (
          <DocumentCard
            documentType="PAN Card"
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

export default PANPage;
