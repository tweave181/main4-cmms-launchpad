
import React from 'react';
import {
  TableHeader,
  TableHead,
  TableRow,
} from '@/components/ui/table';

export const UserTableHeader: React.FC = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Email</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Employment</TableHead>
        <TableHead>Department</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Last Login</TableHead>
        <TableHead>Joined</TableHead>
        <TableHead className="w-[70px]"></TableHead>
      </TableRow>
    </TableHeader>
  );
};
