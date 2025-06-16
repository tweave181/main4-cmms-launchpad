
import React from 'react';
import { Users as UsersIcon } from 'lucide-react';

export const UserListEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8">
      <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <p className="text-muted-foreground">No users found.</p>
    </div>
  );
};
