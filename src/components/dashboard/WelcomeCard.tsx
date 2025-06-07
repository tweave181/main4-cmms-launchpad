
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, User, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const WelcomeCard: React.FC = () => {
  const { userProfile, tenant, isAdmin } = useAuth();

  // Debug logging to see what data we have
  console.log('WelcomeCard - userProfile:', userProfile);
  console.log('WelcomeCard - userProfile.name:', userProfile?.name);

  return (
    <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-semibold">
          Welcome back, {userProfile?.name || 'User'}!
        </CardTitle>
        <CardDescription>
          Your multi-tenant Computerized Maintenance Management System
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <h4 className="text-base font-medium text-gray-700">Organization</h4>
                <p className="text-sm text-muted-foreground">{tenant?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <h4 className="text-base font-medium text-gray-700">Your Role</h4>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {userProfile?.role}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <h4 className="text-base font-medium text-gray-700">Account Type</h4>
                <p className="text-sm text-muted-foreground">
                  {isAdmin ? "Administrator" : "Standard User"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
