import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useValidateInvitation } from '@/hooks/useTenantInvitations';
import { Loader2 } from 'lucide-react';

interface InvitationCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValidated: (code: string) => void;
}

const InvitationCodeDialog: React.FC<InvitationCodeDialogProps> = ({ open, onOpenChange, onValidated }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useValidateInvitation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Please enter your invitation code.');
      return;
    }
    try {
      const result = await mutateAsync(trimmed);
      if (!result?.valid) {
        setError(result?.error || 'Invitation code is not valid.');
        return;
      }
      setCode('');
      onValidated(trimmed);
    } catch (err: any) {
      setError(err?.message || 'Failed to validate code. Please try again.');
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setError(null);
      setCode('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enter Invitation Code</DialogTitle>
          <DialogDescription>
            Paste the invitation code you were given to start creating your account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invitationCode">Invitation Code</Label>
            <Input
              id="invitationCode"
              autoFocus
              autoComplete="off"
              placeholder="e.g. ABCD-1234"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isPending}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Checking...</> : 'Enter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InvitationCodeDialog;
