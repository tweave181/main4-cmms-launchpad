import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Loader2 } from 'lucide-react';
import { useGenerateInvitation } from '@/hooks/useTenantInvitations';
import { toast } from '@/components/ui/use-toast';

interface GenerateInvitationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GenerateInvitationDialog: React.FC<GenerateInvitationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [expiryDays, setExpiryDays] = useState('7');
  const [notes, setNotes] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const generateMutation = useGenerateInvitation();

  const handleGenerate = async () => {
    try {
      const code = await generateMutation.mutateAsync({
        expiresInDays: parseInt(expiryDays),
        notes: notes || undefined,
      });
      setGeneratedCode(code);
      toast({
        title: 'Invitation Generated',
        description: 'The invitation code has been created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate invitation code',
        variant: 'destructive',
      });
    }
  };

  const handleCopy = async () => {
    if (!generatedCode) return;
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast({
        title: 'Copied',
        description: 'Invitation code copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy code',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setGeneratedCode(null);
    setNotes('');
    setExpiryDays('7');
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Invitation Code</DialogTitle>
          <DialogDescription>
            Create a one-time use code for a new tenant to register.
          </DialogDescription>
        </DialogHeader>

        {!generatedCode ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expires In</Label>
              <Select value={expiryDays} onValueChange={setExpiryDays}>
                <SelectTrigger id="expiry">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="e.g., For Acme Corporation - Contact: John Smith"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Invitation Code</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedCode}
                  readOnly
                  className="font-mono text-lg"
                />
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              Share this code with the new tenant. They will need to enter it during registration.
              This code expires in {expiryDays} day{parseInt(expiryDays) !== 1 ? 's' : ''}.
            </div>
          </div>
        )}

        <DialogFooter>
          {!generatedCode ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleGenerate} disabled={generateMutation.isPending}>
                {generateMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GenerateInvitationDialog;
