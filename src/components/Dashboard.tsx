
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Building2, User, Shield, Wrench, Calendar, BarChart3, Settings, Users, Cog } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { userProfile, tenant, isAdmin } = useAuth();

  return (
    <div className="p-6">
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Welcome Card */}
          <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-semibold">Welcome to Main4 CMMS</CardTitle>
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

          {/* Quick Actions */}
          <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-3">
              <Button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold shadow-sm hover:bg-primary/90 transition justify-start" variant="default">
                <Wrench className="w-5 h-5 mr-2" />
                Create Work Order
              </Button>
              <Button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold shadow-sm hover:bg-primary/90 transition justify-start" variant="default">
                <Building2 className="w-5 h-5 mr-2" />
                View Assets
              </Button>
              <Button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold shadow-sm hover:bg-primary/90 transition justify-start" variant="default">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Maintenance
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Stats */}
          <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
            <CardHeader className="p-0 mb-6">
              <CardTitle className="text-2xl font-semibold">Dashboard Stats</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Wrench className="w-5 h-5 mr-2 text-primary" />
                    <span className="text-base font-medium text-gray-700">Open Work Orders</span>
                  </div>
                  <span className="font-semibold text-lg">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-primary" />
                    <span className="text-base font-medium text-gray-700">Total Assets</span>
                  </div>
                  <span className="font-semibold text-lg">45</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    <span className="text-base font-medium text-gray-700">Scheduled Tasks</span>
                  </div>
                  <span className="font-semibold text-lg">8</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Panel */}
          {isAdmin && (
            <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-semibold flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span>Admin Panel</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                <Button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold shadow-sm hover:bg-primary/90 transition justify-start" variant="default">
                  <Users className="w-5 h-5 mr-2" />
                  Manage Users
                </Button>
                <Button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold shadow-sm hover:bg-primary/90 transition justify-start" variant="default">
                  <Settings className="w-5 h-5 mr-2" />
                  Organization Settings
                </Button>
                <Button className="w-full rounded-2xl bg-primary px-6 py-3 font-semibold shadow-sm hover:bg-primary/90 transition justify-start" variant="default">
                  <Cog className="w-5 h-5 mr-2" />
                  System Configuration
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
