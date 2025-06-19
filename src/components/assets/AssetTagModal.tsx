
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface AssetTagPrefix {
  id: string;
  prefix_letter: string;
  number_code: string;
  description: string;
}

interface AssetTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagSelect: (tag: string) => void;
  currentTag?: string;
}

export const AssetTagModal: React.FC<AssetTagModalProps> = ({
  isOpen,
  onClose,
  onTagSelect,
  currentTag = '',
}) => {
  const { userProfile } = useAuth();
  const [selectedPrefix, setSelectedPrefix] = useState<AssetTagPrefix | null>(null);
  const [sequenceNumber, setSequenceNumber] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Fetch available asset tag prefixes
  const { data: prefixes = [], isLoading } = useQuery({
    queryKey: ['assetTagPrefixes', userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('asset_tag_prefixes')
        .select('*')
        .order('prefix_letter', { ascending: true })
        .order('number_code', { ascending: true });

      if (error) throw error;
      return data as AssetTagPrefix[];
    },
    enabled: !!userProfile?.tenant_id,
  });

  const validateAndSelectTag = async () => {
    if (!selectedPrefix || !sequenceNumber) {
      setValidationError('Please select a prefix and enter a sequence number');
      return;
    }

    if (!/^\d{4}$/.test(sequenceNumber)) {
      setValidationError('Sequence number must be exactly 4 digits');
      return;
    }

    const proposedTag = `${selectedPrefix.prefix_letter}${selectedPrefix.number_code}-${sequenceNumber}`;
    
    // Skip validation if this is the current tag (editing existing asset)
    if (proposedTag === currentTag) {
      onTagSelect(proposedTag);
      handleClose();
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      // Check if tag already exists
      const { data, error } = await supabase
        .from('assets')
        .select('id')
        .eq('asset_tag', proposedTag)
        .eq('tenant_id', userProfile?.tenant_id);

      if (error) throw error;

      if (data && data.length > 0) {
        setValidationError('This asset tag is already in use. Please choose a different sequence number.');
        return;
      }

      onTagSelect(proposedTag);
      handleClose();
    } catch (error) {
      console.error('Error validating asset tag:', error);
      setValidationError('Error validating asset tag. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    setSelectedPrefix(null);
    setSequenceNumber('');
    setValidationError('');
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Asset Tag</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Asset Tag</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="prefix-select">Asset Type Prefix</Label>
            <Select onValueChange={(value) => {
              const prefix = prefixes.find(p => p.id === value);
              setSelectedPrefix(prefix || null);
              setValidationError('');
            }}>
              <SelectTrigger id="prefix-select">
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                {prefixes.map((prefix) => (
                  <SelectItem key={prefix.id} value={prefix.id}>
                    {prefix.prefix_letter}{prefix.number_code} - {prefix.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="sequence-input">Sequence Number (4 digits)</Label>
            <Input
              id="sequence-input"
              type="text"
              placeholder="0001"
              value={sequenceNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setSequenceNumber(value);
                setValidationError('');
              }}
              maxLength={4}
            />
          </div>

          {selectedPrefix && sequenceNumber && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <Label className="text-sm text-gray-600">Generated Asset Tag:</Label>
              <div className="text-lg font-mono font-semibold">
                {selectedPrefix.prefix_letter}{selectedPrefix.number_code}-{sequenceNumber.padStart(4, '0')}
              </div>
            </div>
          )}

          {validationError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={validateAndSelectTag}
              disabled={!selectedPrefix || !sequenceNumber || isValidating}
            >
              {isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Validating...
                </>
              ) : (
                'Select Tag'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
