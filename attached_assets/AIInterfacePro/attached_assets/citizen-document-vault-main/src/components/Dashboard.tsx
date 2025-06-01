
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  FileText, 
  Vote, 
  Car, 
  ShoppingCart,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const documents = [
    {
      type: 'Aadhaar',
      icon: CreditCard,
      status: 'active',
      lastUpdated: '2024-03-15',
      route: '/aadhaar'
    },
    {
      type: 'PAN Card',
      icon: FileText,
      status: 'active',
      lastUpdated: '2024-02-10',
      route: '/pan'
    },
    {
      type: 'Voter ID',
      icon: Vote,
      status: 'pending',
      lastUpdated: '2024-01-20',
      route: '/voter-id'
    },
    {
      type: 'Driving License',
      icon: Car,
      status: 'active',
      lastUpdated: '2024-03-01',
      route: '/driving-license'
    },
    {
      type: 'Ration Card',
      icon: ShoppingCart,
      status: 'active',
      lastUpdated: '2024-02-28',
      route: '/ration-card'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const recentActivity = [
    {
      action: 'Aadhaar address updated',
      date: '2024-03-15',
      status: 'completed'
    },
    {
      action: 'PAN card verification pending',
      date: '2024-03-10',
      status: 'pending'
    },
    {
      action: 'Voter ID application submitted',
      date: '2024-03-05',
      status: 'pending'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.fullName}!
        </h1>
        <p className="text-gray-600">
          Manage your government documents and services in one place.
        </p>
        {user?.sevaPortalUniqueID && (
          <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full bg-orange-600 text-white text-sm font-medium">
            Seva Portal ID: {user.sevaPortalUniqueID}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <FileText className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Documents</p>
                <p className="text-2xl font-bold text-green-600">4</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-yellow-600">1</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents Grid */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Documents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => {
            const IconComponent = doc.icon;
            return (
              <Card key={doc.type} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <IconComponent className="w-8 h-8 text-orange-600" />
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(doc.status)}
                      <span className={`status-badge status-${doc.status}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{doc.type}</CardTitle>
                  <CardDescription>
                    Last updated: {doc.lastUpdated}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate(doc.route)}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-600">{activity.date}</p>
                </div>
                <span className={`status-badge status-${activity.status}`}>
                  {activity.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
