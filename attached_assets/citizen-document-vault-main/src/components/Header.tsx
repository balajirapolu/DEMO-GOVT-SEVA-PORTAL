
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="govt-header shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold text-xl">SP</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Seva Portal</h1>
              <p className="text-orange-100 text-sm">Government of India</p>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">{user.fullName}</p>
                {user.sevaPortalUniqueID && (
                  <p className="text-orange-100 text-sm">ID: {user.sevaPortalUniqueID}</p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="bg-white text-orange-600 hover:bg-orange-50 border-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
