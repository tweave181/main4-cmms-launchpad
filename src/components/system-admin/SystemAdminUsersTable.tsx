import { Crown, Trash2, Loader2 } from 'lucide-react';
import { useSystemAdminUsers } from '@/hooks/useSystemAdminUsers';
import { useRemoveSystemAdminRole } from '@/hooks/useSystemAdminRole';
import { useAuth } from '@/contexts/auth';
import { useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export const SystemAdminUsersTable = () => {
  const { user } = useAuth();
  const { data: admins, isLoading } = useSystemAdminUsers();
  const removeRole = useRemoveSystemAdminRole();
  const queryClient = useQueryClient();

  const handleRemove = async (userId: string) => {
    await removeRole.mutateAsync(userId);
    queryClient.invalidateQueries({ queryKey: ['systemAdminUsers'] });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            System Administrators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-500" />
          System Administrators
          <Badge variant="secondary" className="ml-2">
            {admins?.length || 0}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {admins && admins.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.userId}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      {admin.userName}
                    </div>
                  </TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{admin.tenantName}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {admin.roleAssignedAt
                      ? format(new Date(admin.roleAssignedAt), 'dd MMM yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {admin.assignedByName || '-'}
                  </TableCell>
                  <TableCell>
                    {admin.userId === user?.id ? (
                      <span className="text-xs text-muted-foreground">You</span>
                    ) : (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={removeRole.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove System Admin Role</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove the system admin role from{' '}
                              <strong>{admin.userName}</strong>? They will lose access to
                              cross-tenant administration features.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemove(admin.userId)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Remove Role
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-center py-8">
            No system administrators found.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
