
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TableCell, TableRow } from '@/components/ui/table';
import { Phone } from 'lucide-react';
import { format } from 'date-fns';
import { UserRoleBadge } from './UserRoleBadge';
import { UserEmploymentBadge } from './UserEmploymentBadge';

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
  return (
    <TableRow className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => onUserClick(user)}>
      <TableCell className="font-medium">{user.name}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <UserRoleBadge role={user.role} />
      </TableCell>
      <TableCell>
        <UserEmploymentBadge employmentStatus={user.employment_status || undefined} />
      </TableCell>
      <TableCell>
        {user.departments?.name || 'No department'}
      </TableCell>
      <TableCell>
        {user.job_titles?.title_name || 'No job title'}
      </TableCell>
      <TableCell>
        {user.phone_number ? (
          <div className="flex items-center space-x-1">
            <Phone className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{user.phone_number}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
          {user.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>
        {user.last_login 
          ? format(new Date(user.last_login), 'MMM d, yyyy')
          : 'Never'
        }
      </TableCell>
      <TableCell>
        {format(new Date(user.created_at), 'MMM d, yyyy')}
      </TableCell>
    </TableRow>
  );
};
