
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserX, UserCheck, Edit } from 'lucide-react';
import { EditUserDialog } from './EditUserDialog';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

interface UserActionsDropdownProps {
  user: User;
  onToggleStatus: (userId: string, currentStatus: string) => void;
  isUpdating: boolean;
}

export const UserActionsDropdown: React.FC<UserActionsDropdownProps> = ({
  user,
  onToggleStatus,
  isUpdating,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <EditUserDialog 
          user={user}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </DropdownMenuItem>
          }
        />
        <DropdownMenuItem
          onClick={() => onToggleStatus(user.id, user.status)}
          disabled={isUpdating}
        >
          {user.status === 'active' ? (
            <>
              <UserX className="h-4 w-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4 mr-2" />
              Activate
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
