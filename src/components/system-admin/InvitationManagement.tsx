import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Copy, Ban, Check } from 'lucide-react';
import { useTenantInvitations, useRevokeInvitation } from '@/hooks/useTenantInvitations';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import GenerateInvitationDialog from './GenerateInvitationDialog';

const InvitationManagement: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { data: invitations, isLoading } = useTenantInvitations();
  const revokeMutation = useRevokeInvitation();

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      toast({
        title: 'Copied',
        description: 'Invitation code copied to clipboard',
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy code',
        variant: 'destructive',
      });
    }
  };

  const handleRevoke = async (code: string) => {
    try {
      await revokeMutation.mutateAsync(code);
      toast({
        title: 'Revoked',
        description: 'Invitation has been revoked',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to revoke invitation',
        variant: 'destructive',
      });
    }
  };

  const getStatus = (invitation: typeof invitations extends (infer T)[] ? T : never) => {
    if (invitation.is_revoked) {
      return { label: 'Revoked', variant: 'destructive' as const };
    }
    if (invitation.used_at) {
      return { label: 'Used', variant: 'secondary' as const };
    }
    if (new Date(invitation.expires_at) < new Date()) {
      return { label: 'Expired', variant: 'outline' as const };
    }
    return { label: 'Pending', variant: 'default' as const };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tenant Invitations</CardTitle>
            <CardDescription>
              Generate and manage invitation codes for new tenant registrations
            </CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Invitation
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : !invitations?.length ? (
          <div className="text-center py-8 text-muted-foreground">
            No invitations yet. Generate one to allow new tenants to register.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((invitation) => {
                const status = getStatus(invitation);
                const isPending = status.label === 'Pending';
                
                return (
                  <TableRow key={invitation.id}>
                    <TableCell className="font-mono text-sm">
                      {invitation.code}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invitation.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {invitation.notes || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {isPending && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleCopyCode(invitation.code)}
                            >
                              {copiedCode === invitation.code ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRevoke(invitation.code)}
                              disabled={revokeMutation.isPending}
                            >
                              <Ban className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <GenerateInvitationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </Card>
  );
};

export default InvitationManagement;
