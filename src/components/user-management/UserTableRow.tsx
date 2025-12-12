
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { Phone, Shield, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { UserRoleBadge } from './UserRoleBadge';
import { UserEmploymentBadge } from './UserEmploymentBadge';
import { UserPermissionsOverride } from '@/components/permissions/UserPermissionsOverride';
import { SystemAdminRoleToggle } from './SystemAdminRoleToggle';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import type { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'] & {
  departments?: { id: string; name: string } | null;
  job_titles?: { id: string; title_name: string } | null;
};

interface UserTableRowProps {
  user: User;
  onToggleStatus: (userId: string, currentStatus: string) => void;
  isUpdating: boolean;
  onUserClick: (user: User) => void;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  onToggleStatus,
  isUpdating,
  onUserClick,
}) => {
  const { isSystemAdmin } = useAuth();
  
  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium cursor-pointer" onClick={() => onUserClick(user)}>
        {user.name}
      </TableCell>
      <TableCell className="cursor-pointer" onClick={() => onUserClick(user)}>
        {user.email}
      </TableCell>
      <TableCell className="cursor-pointer" onClick={() => onUserClick(user)}>
        <UserRoleBadge role={user.role} />
      </TableCell>
      <TableCell className="cursor-pointer" onClick={() => onUserClick(user)}>
        <UserEmploymentBadge employmentStatus={user.employment_status || undefined} />
      </TableCell>
      <TableCell className="cursor-pointer" onClick={() => onUserClick(user)}>
        {user.departments?.name || 'No department'}
      </TableCell>
      <TableCell className="cursor-pointer" onClick={() => onUserClick(user)}>
        {user.job_titles?.title_name || 'No job title'}
      </TableCell>
      <TableCell className="cursor-pointer" onClick={() => onUserClick(user)}>
        {user.phone_number ? (
          <div className="flex items-center space-x-1">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{user.phone_number}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      <TableCell className="cursor-pointer" onClick={() => onUserClick(user)}>
        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
          {user.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell className="cursor-pointer" onClick={() => onUserClick(user)}>
        {user.available_for_time_tracking ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-gray-400" />
        )}
      </TableCell>
      <TableCell className="cursor-pointer" onClick={() => onUserClick(user)}>
        {user.last_login 
          ? format(new Date(user.last_login), 'MMM d, yyyy')
          : 'Never'
        }
      </TableCell>
      <TableCell className="cursor-pointer" onClick={() => onUserClick(user)}>
        {format(new Date(user.created_at), 'MMM d, yyyy')}
      </TableCell>
      {isSystemAdmin && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <SystemAdminRoleToggle userId={user.id} userName={user.name} />
        </TableCell>
      )}
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          {isSystemAdmin && (
            <UserPermissionsOverride
              userId={user.id}
              userName={user.name}
              trigger={
                <Button variant="ghost" size="sm">
                  <Shield className="h-4 w-4" />
                </Button>
              }
            />
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
