
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DocumentCard from '@/components/DocumentCard';
import DocumentUpdateForm from '@/components/DocumentUpdateForm';
import RationCardCreationForm from '@/components/RationCardCreationForm';
import Header from '@/components/Header';

const RationCardPage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [hasDocument] = useState(false);

  const rationCardData = {
    rationCardNumber: 'RC123456789',
    headOfFamily: 'John Doe',
    fpsId: 'FPS001',
    fpsName: 'Central Fair Price Shop',
    districtName: 'New Delhi',
    category: 'APL',
    blockName: 'Central Delhi',
    address: '123 Main Street, New Delhi, Delhi - 110001',
    familyMembers: '4'
  };

  const documentFields = [
    { label: 'Ration Card Number', value: rationCardData.rationCardNumber, key: 'rationCardNumber', editable: false },
    { label: 'Head of Family', value: rationCardData.headOfFamily, key: 'headOfFamily' },
    { label: 'FPS ID', value: rationCardData.fpsId, key: 'fpsId' },
    { label: 'FPS Name', value: rationCardData.fpsName, key: 'fpsName' },
    { label: 'District Name', value: rationCardData.districtName, key: 'districtName' },
    { label: 'Category', value: rationCardData.category, key: 'category' },
    { label: 'Block Name', value: rationCardData.blockName, key: 'blockName' },
    { label: 'Address', value: rationCardData.address, key: 'address', type: 'textarea' as const },
    { label: 'Family Members', value: rationCardData.familyMembers, key: 'familyMembers' }
  ];

  const handleSave = async (updatedData: Record<string, string>) => {
    console.log('Saving Ration Card data:', updatedData);
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleCreate = async (formData: Record<string, string>, files: { aadhaar: File | null, residency: File | null, income: File | null, birth: File | null }) => {
    console.log('Creating Ration Card with data:', formData);
    console.log('Files:', files);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6">
        {isCreating ? (
          <RationCardCreationForm
            onBack={() => setIsCreating(false)}
            onSave={handleCreate}
          />
        ) : isEditing ? (
          <DocumentUpdateForm
            documentType="Ration Card"
            fields={documentFields}
            onBack={() => setIsEditing(false)}
            onSave={handleSave}
            userMobile={user?.aadhaarLinkedMobile || user?.mobileNumber || ''}
          />
        ) : (
          <DocumentCard
            documentType="Ration Card"
            fields={documentFields}
            status="active"
            lastUpdated="2024-02-05"
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

export default RationCardPage;
