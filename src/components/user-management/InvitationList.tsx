
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, Trash2, Copy, Shield, Users as UsersIcon, Wrench, Building, Mail } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useInvitations } from '@/hooks/queries/useInvitations';
import { useDeleteInvitation } from '@/hooks/mutations/useDeleteInvitation';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

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

export const InvitationList: React.FC = () => {
  const { data: invitations, isLoading, error } = useInvitations();
  const deleteInvitationMutation = useDeleteInvitation();

  const handleDeleteInvitation = async (invitationId: string) => {
    try {
      await deleteInvitationMutation.mutateAsync(invitationId);
      toast({
        title: "Success",
        description: "Invitation deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete invitation",
        variant: "destructive",
      });
    }
  };

  const handleCopyInvitationLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({
      title: "Success",
      description: "Invitation link copied to clipboard",
    });
  };

  const getStatusBadge = (invitation: any) => {
    if (invitation.accepted_at) {
      return <Badge variant="default">Accepted</Badge>;
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    return <Badge variant="secondary">Pending</Badge>;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load invitations. Please try again.</p>
      </div>
    );
  }

  if (!invitations || invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No pending invitations.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Invited</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invitations.map((invitation) => (
            <TableRow key={invitation.id}>
              <TableCell className="font-medium">{invitation.email}</TableCell>
              <TableCell>
                <Badge 
                  variant={getRoleBadgeVariant(invitation.role)} 
                  className="flex items-center space-x-1 w-fit"
                >
                  {getRoleIcon(invitation.role)}
                  <span className="capitalize">{invitation.role}</span>
                </Badge>
              </TableCell>
              <TableCell>
                {getStatusBadge(invitation)}
              </TableCell>
              <TableCell>
                {format(new Date(invitation.created_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!invitation.accepted_at && (
                      <DropdownMenuItem
                        onClick={() => handleCopyInvitationLink(invitation.token)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleDeleteInvitation(invitation.id)}
                      disabled={deleteInvitationMutation.isPending}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
