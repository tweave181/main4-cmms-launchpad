
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserEmploymentBadgeProps {
  employmentStatus?: string;
}

const getEmploymentStatusColor = (status: string) => {
  switch (status) {
    case 'Full Time':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'Part Time':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Bank Staff':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Contractor':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const UserEmploymentBadge: React.FC<UserEmploymentBadgeProps> = ({ employmentStatus }) => {
  if (!employmentStatus) {
    return null;
  }

  return (
    <Badge className={`text-xs ${getEmploymentStatusColor(employmentStatus)}`}>
      {employmentStatus}
    </Badge>
  );
};
