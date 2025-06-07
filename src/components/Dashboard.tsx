
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Building2, User, Shield } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Dashboard: React.FC = () => {
  const { userProfile, tenant, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-semibold">Main4 CMMS</h1>
                {tenant && (
                  <p className="text-sm text-muted-foreground">{tenant.name}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {userProfile?.name}
                </span>
                {isAdmin && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Shield className="h-3 w-3" />
                    <span>Admin</span>
                  </Badge>
                )}
              </div>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Welcome to Main4 CMMS</CardTitle>
              <CardDescription>
                Your multi-tenant Computerized Maintenance Management System
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Organization</h4>
                  <p className="text-sm text-muted-foreground">{tenant?.name}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Your Role</h4>
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {userProfile?.role}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Account Type</h4>
                  <p className="text-sm text-muted-foreground">
                    {isAdmin ? "Administrator" : "Standard User"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline">
                Create Work Order
              </Button>
              <Button className="w-full" variant="outline">
                View Assets
              </Button>
              <Button className="w-full" variant="outline">
                Schedule Maintenance
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Open Work Orders</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Total Assets</span>
                  <span className="font-medium">45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Scheduled Tasks</span>
                  <span className="font-medium">8</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Panel */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Admin Panel</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline">
                  Manage Users
                </Button>
                <Button className="w-full" variant="outline">
                  Organization Settings
                </Button>
                <Button className="w-full" variant="outline">
                  System Configuration
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
