
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DocumentCard from '@/components/DocumentCard';
import DocumentUpdateForm from '@/components/DocumentUpdateForm';
import VoterIDCreationForm from '@/components/VoterIDCreationForm';
import Header from '@/components/Header';

const VoterIDPage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasDocument] = useState(false);

  const voterIDData = {
    voterID: 'ABC1234567',
    fullName: 'John Doe',
    fatherName: 'Robert Doe',
    dateOfBirth: '01/01/1990',
    address: '123 Main Street, New Delhi, Delhi - 110001',
    constituency: 'New Delhi',
    assemblyConstituency: 'New Delhi Assembly'
  };

  const documentFields = [
    { label: 'Voter ID Number', value: voterIDData.voterID, key: 'voterID', editable: false },
    { label: 'Full Name', value: voterIDData.fullName, key: 'fullName' },
    { label: 'Father\'s Name', value: voterIDData.fatherName, key: 'fatherName' },
    { label: 'Date of Birth', value: voterIDData.dateOfBirth, key: 'dateOfBirth', type: 'date' as const },
    { label: 'Address', value: voterIDData.address, key: 'address', type: 'textarea' as const },
    { label: 'Constituency', value: voterIDData.constituency, key: 'constituency' },
    { label: 'Assembly Constituency', value: voterIDData.assemblyConstituency, key: 'assemblyConstituency' }
  ];

  const handleSave = async (updatedData: Record<string, string>) => {
    console.log('Saving Voter ID data:', updatedData);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleCreate = async (formData: Record<string, string>, aadhaarFile: File | null, panFile: File | null) => {
    console.log('Creating Voter ID with data:', formData);
    console.log('Aadhaar file:', aadhaarFile);
    console.log('PAN file:', panFile);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        {isCreating ? (
          <VoterIDCreationForm
            onBack={() => setIsCreating(false)}
            onSave={handleCreate}
          />
        ) : isEditing ? (
          <DocumentUpdateForm
            documentType="Voter ID"
            fields={documentFields}
            onBack={() => setIsEditing(false)}
            onSave={handleSave}
            userMobile={user?.aadhaarLinkedMobile || user?.mobileNumber || ''}
          />
        ) : (
          <DocumentCard
            documentType="Voter ID Card"
            fields={documentFields}
            status="active"
            lastUpdated="2024-02-15"
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

export default VoterIDPage;
