
import React from 'react';
import { Table, TableBody } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers } from '@/hooks/queries/useUsers';
import { useUpdateUserStatus } from '@/hooks/mutations/useUpdateUserStatus';
import { UserTableHeader } from './UserTableHeader';
import { UserTableRow } from './UserTableRow';
import { UserListEmptyState } from './UserListEmptyState';
import { toast } from '@/components/ui/use-toast';

export const UserList: React.FC = () => {
  const { data: users, isLoading, error } = useUsers();
  const updateUserStatusMutation = useUpdateUserStatus();

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      await updateUserStatusMutation.mutateAsync({ userId, status: newStatus });
      toast({
        title: "Success",
        description: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load users. Please try again.</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return <UserListEmptyState />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <UserTableHeader />
        <TableBody>
          {users.map((user) => (
            <UserTableRow
              key={user.id}
              user={user}
              onToggleStatus={handleToggleUserStatus}
              isUpdating={updateUserStatusMutation.isPending}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
