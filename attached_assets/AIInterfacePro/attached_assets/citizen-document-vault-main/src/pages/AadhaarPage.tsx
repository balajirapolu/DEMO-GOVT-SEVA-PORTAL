
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DocumentCard from '@/components/DocumentCard';
import DocumentUpdateForm from '@/components/DocumentUpdateForm';
import Header from '@/components/Header';

const AadhaarPage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [hasDocument] = useState(true); // Mock data - in real app, fetch from API

  // Mock Aadhaar data
  const aadhaarData = {
    aadhaarNumber: '1234 5678 9012',
    fullName: 'John Doe',
    dateOfBirth: '01/01/1990',
    gender: 'Male',
    fatherName: 'Robert Doe',
    address: '123 Main Street, New Delhi, Delhi - 110001',
    mobileNumber: '+91 9876543210',
    email: 'john.doe@email.com'
  };

  const documentFields = [
    { label: 'Aadhaar Number', value: aadhaarData.aadhaarNumber, key: 'aadhaarNumber', editable: false },
    { label: 'Full Name', value: aadhaarData.fullName, key: 'fullName' },
    { label: 'Date of Birth', value: aadhaarData.dateOfBirth, key: 'dateOfBirth', type: 'date' as const },
    { label: 'Gender', value: aadhaarData.gender, key: 'gender' },
    { label: 'Father\'s Name', value: aadhaarData.fatherName, key: 'fatherName' },
    { label: 'Address', value: aadhaarData.address, key: 'address', type: 'textarea' as const },
    { label: 'Mobile Number', value: aadhaarData.mobileNumber, key: 'mobileNumber', type: 'tel' as const },
    { label: 'Email', value: aadhaarData.email, key: 'email', type: 'email' as const }
  ];

  const handleSave = async (updatedData: Record<string, string>) => {
    // Mock API call to save data
    console.log('Saving Aadhaar data:', updatedData);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        {isEditing ? (
          <DocumentUpdateForm
            documentType="Aadhaar"
            fields={documentFields}
            onBack={() => setIsEditing(false)}
            onSave={handleSave}
            userMobile={user?.aadhaarLinkedMobile || user?.mobileNumber || ''}
          />
        ) : (
          <DocumentCard
            documentType="Aadhaar Card"
            fields={documentFields}
            status="active"
            lastUpdated="2024-03-15"
            onEdit={() => setIsEditing(true)}
            hasDocument={hasDocument}
            onApply={() => setIsEditing(true)}
            isAadhaar={true}
          />
        )}
      </div>
    </div>
  );
};

export default AadhaarPage;
