
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Edit, FileText, Clock, CheckCircle, AlertCircle, ArrowLeft, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DocumentField {
  label: string;
  value: string;
  key: string;
  editable?: boolean;
}

interface DocumentCardProps {
  documentType: string;
  fields: DocumentField[];
  status: 'active' | 'pending' | 'rejected';
  lastUpdated: string;
  onEdit: () => void;
  hasDocument: boolean;
  onApply?: () => void;
  onCreate?: () => void;
  showBackButton?: boolean;
  isAadhaar?: boolean;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  documentType,
  fields,
  status,
  lastUpdated,
  onEdit,
  hasDocument,
  onApply,
  onCreate,
  showBackButton = true,
  isAadhaar = false
}) => {
  const navigate = useNavigate();

  const getStatusIcon = () => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!hasDocument) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          {showBackButton && (
            <div className="flex items-center mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          )}
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">{documentType}</CardTitle>
            <CardDescription>
              You haven't applied for {documentType} yet. Click below to start your application.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          {isAadhaar ? (
            <Button 
              onClick={onApply}
              className="bg-orange-600 hover:bg-orange-700"
              size="lg"
            >
              Apply for {documentType}
            </Button>
          ) : (
            <Button 
              onClick={onCreate}
              className="bg-orange-600 hover:bg-orange-700"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create {documentType}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        {showBackButton && (
          <div className="flex items-center mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center">
              <FileText className="w-6 h-6 mr-2 text-orange-600" />
              {documentType}
            </CardTitle>
            <CardDescription>Last updated: {lastUpdated}</CardDescription>
          </div>
          <Badge className={`${getStatusColor()} flex items-center space-x-1`}>
            {getStatusIcon()}
            <span className="capitalize">{status}</span>
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.map((field, index) => (
            <div key={field.key} className="space-y-1">
              <label className="text-sm font-medium text-gray-600">
                {field.label}
              </label>
              <p className="text-base text-gray-900 font-medium">
                {field.value || 'Not provided'}
              </p>
            </div>
          ))}
        </div>
        
        <Separator />
        
        <div className="flex justify-center space-x-4">
          {!isAadhaar && (
            <Button 
              onClick={onCreate}
              className="bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New {documentType}
            </Button>
          )}
          <Button 
            onClick={onEdit}
            className="bg-orange-600 hover:bg-orange-700"
            size="lg"
          >
            <Edit className="w-4 h-4 mr-2" />
            Update Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
