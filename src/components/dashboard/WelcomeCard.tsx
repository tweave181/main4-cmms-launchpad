
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, User, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/auth';

export const WelcomeCard: React.FC = () => {
  const { userProfile, tenant, isAdmin, loading, ready } = useAuth();

  // Debug logging to see what data we have
  console.log('WelcomeCard - userProfile:', userProfile);
  console.log('WelcomeCard - userProfile.name:', userProfile?.name);
  console.log('WelcomeCard - loading:', loading, 'ready:', ready);

  if (loading || !ready) {
    return (
      <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
        <CardHeader className="p-0 mb-6">
          <CardTitle className="text-2xl font-semibold">
            <Skeleton className="h-8 w-64" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-96" />
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-5 h-5" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="w-5 h-5" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="w-5 h-5" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
      <CardHeader className="p-0 mb-6">
        <CardTitle className="text-2xl font-semibold">
          Welcome back, {userProfile?.name?.split(' ')[0] || 'User'}!
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
                <p className="text-sm text-muted-foreground">{tenant?.name || 'Loading...'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-primary" />
              <div>
                <h4 className="text-base font-medium text-gray-700">Your Role</h4>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {userProfile?.role || 'Loading...'}
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
                {userProfile?.last_login && (
                  <div className="flex items-center space-x-2 mt-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Last login: {new Date(userProfile.last_login).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
