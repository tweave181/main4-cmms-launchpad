import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users } from 'lucide-react';

interface DepartmentLinkedUsersProps {
  departmentId: string;
}

interface LinkedUser {
  id: string;
  name: string;
  email: string;
  job_title: { title_name: string } | null;
}

export const DepartmentLinkedUsers: React.FC<DepartmentLinkedUsersProps> = ({ departmentId }) => {
  const navigate = useNavigate();

  const { data: linkedUsers = [] } = useQuery({
    queryKey: ['department-users', departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, job_title:job_title_id(title_name)')
        .eq('department_id', departmentId)
        .order('name');
      if (error) throw error;
      return (data || []) as LinkedUser[];
    },
    enabled: !!departmentId,
  });

  return (
    <Card className="rounded-2xl shadow-sm border border-border">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <span>Linked Users ({linkedUsers.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {linkedUsers.length === 0 ? (
          <p className="text-muted-foreground text-sm">No users are assigned to this department.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Job Title</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linkedUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => navigate(`/users?userId=${user.id}`)}
                >
                  <TableCell className="font-medium">{user.name || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.job_title?.title_name || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export const useDepartmentLinkedUsers = (departmentId: string) => {
  return useQuery({
    queryKey: ['department-users', departmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('department_id', departmentId)
        .limit(1);
      if (error) throw error;
      return data || [];
    },
    enabled: !!departmentId,
  });
};
