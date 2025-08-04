
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReusableTabs, TabItem } from '@/components/ui/reusable-tabs';
import { Users, UserCheck, Mail } from 'lucide-react';
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
          <ReusableTabs
            tabs={[
              {
                value: "users",
                label: "Users",
                icon: UserCheck,
                content: <UserList />
              },
              {
                value: "invitations",
                label: "Invitations",
                icon: Mail,
                content: <InvitationList />
              }
            ]}
            defaultValue="users"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
