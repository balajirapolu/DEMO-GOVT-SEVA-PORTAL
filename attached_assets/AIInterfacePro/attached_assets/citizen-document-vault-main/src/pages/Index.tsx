
import React, { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';

const Index = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 govt-pattern">
      {/* Header */}
      <div className="govt-header shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-orange-600 font-bold text-2xl">SP</span>
              </div>
              <div className="text-left">
                <h1 className="text-4xl font-bold">Seva Portal</h1>
                <p className="text-orange-100">Government of India - Digital Document Management</p>
              </div>
            </div>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto">
              Manage all your government documents in one secure, digital platform
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Features Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-lg border border-orange-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Secure Document Management</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Aadhaar Card Management</li>
                <li>• PAN Card Services</li>
                <li>• Voter ID Management</li>
                <li>• Driving License Services</li>
                <li>• Ration Card Management</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-lg border border-orange-100">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Easy Updates & Verification</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Real-time OTP verification</li>
                <li>• Minor changes processed instantly</li>
                <li>• Major changes with admin approval</li>
                <li>• Track application status</li>
                <li>• Secure digital platform</li>
              </ul>
            </div>
          </div>

          {/* Auth Forms */}
          <div className="flex justify-center">
            {isLogin ? (
              <LoginForm onToggleMode={() => setIsLogin(false)} />
            ) : (
              <RegisterForm onToggleMode={() => setIsLogin(true)} />
            )}
          </div>

          {/* Footer Info */}
          <div className="mt-12 text-center">
            <div className="bg-white rounded-lg p-6 shadow-lg border border-orange-100">
              <h4 className="font-semibold text-gray-900 mb-2">Secure & Trusted Platform</h4>
              <p className="text-gray-600 text-sm">
                Your data is protected with bank-level security. All transactions are encrypted and verified through OTP.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
