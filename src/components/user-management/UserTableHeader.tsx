import React from 'react';
import { TableHeader, TableHead, TableRow } from '@/components/ui/table';
export const UserTableHeader: React.FC = () => {
  return <TableHeader>
      <TableRow className="bg-gray-300">
        <TableHead className="bg-gray-300">Name</TableHead>
        <TableHead className="bg-gray-300">Email</TableHead>
        <TableHead className="bg-gray-300">Role</TableHead>
        <TableHead className="bg-gray-300">Employment</TableHead>
        <TableHead>Department</TableHead>
        <TableHead>Job Title</TableHead>
        <TableHead>Phone</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Time Tracking</TableHead>
        <TableHead>Last Login</TableHead>
        <TableHead>Joined</TableHead>
        
      </TableRow>
    </TableHeader>;
};