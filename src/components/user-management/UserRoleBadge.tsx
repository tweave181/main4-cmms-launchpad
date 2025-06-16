
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Users as UsersIcon, Wrench, Building } from 'lucide-react';

interface UserRoleBadgeProps {
  role: string;
}

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <Shield className="h-4 w-4" />;
    case 'manager':
      return <UsersIcon className="h-4 w-4" />;
    case 'technician':
      return <Wrench className="h-4 w-4" />;
    case 'contractor':
      return <Building className="h-4 w-4" />;
    default:
      return <UsersIcon className="h-4 w-4" />;
  }
};

const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'manager':
      return 'default';
    case 'technician':
      return 'secondary';
    case 'contractor':
      return 'outline';
    default:
      return 'secondary';
  }
};

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  return (
    <Badge 
      variant={getRoleBadgeVariant(role) as any}
      className="flex items-center space-x-1 w-fit"
    >
      {getRoleIcon(role)}
      <span className="capitalize">{role}</span>
    </Badge>
  );
};
