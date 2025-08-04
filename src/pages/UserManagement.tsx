
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserPlus } from 'lucide-react';
import { UserList } from '@/components/user-management/UserList';
import { InvitationList } from '@/components/user-management/InvitationList';
import { InviteUserDialog } from '@/components/user-management/InviteUserDialog';
import { useAuth } from '@/contexts/auth';

const UserManagement: React.FC = () => {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Access denied. This page is only available to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
              <Users className="h-6 w-6 text-primary" />
              <span>User Management</span>
            </CardTitle>
            <InviteUserDialog />
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <div className="mb-4">
              <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                <TabsTrigger value="users" className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  Users
                </TabsTrigger>
                <TabsTrigger value="invitations" className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                  Invitations
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="users" className="mt-0">
              <UserList />
            </TabsContent>
            <TabsContent value="invitations" className="mt-0">
              <InvitationList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
