
import React, { useState, useEffect } from 'react';
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
  const [nextSequence, setNextSequence] = useState<string>('');
  const [generatedTag, setGeneratedTag] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
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

  // Generate next available sequence number for selected prefix
  const generateNextSequence = async (prefix: AssetTagPrefix) => {
    if (!userProfile?.tenant_id) return;

    setIsGenerating(true);
    setValidationError('');

    try {
      // Convert number_code to single digit (remove leading zeros)
      const singleDigitCode = parseInt(prefix.number_code).toString();
      const basePattern = `${prefix.prefix_letter}${singleDigitCode}/`;

      // Query existing assets to find the highest sequence number
      const { data, error } = await supabase
        .from('assets')
        .select('asset_tag')
        .eq('tenant_id', userProfile.tenant_id)
        .like('asset_tag', `${basePattern}%`);

      if (error) throw error;

      let maxSequence = 0;
      
      if (data && data.length > 0) {
        // Extract sequence numbers from existing tags
        data.forEach(asset => {
          if (asset.asset_tag) {
            const match = asset.asset_tag.match(new RegExp(`^${prefix.prefix_letter}${singleDigitCode}/([0-9]{3})$`));
            if (match) {
              const sequence = parseInt(match[1]);
              if (sequence > maxSequence) {
                maxSequence = sequence;
              }
            }
          }
        });
      }

      // Generate next sequence number (3 digits, zero-padded)
      const nextSeq = (maxSequence + 1).toString().padStart(3, '0');
      const newTag = `${prefix.prefix_letter}${singleDigitCode}/${nextSeq}`;

      setNextSequence(nextSeq);
      setGeneratedTag(newTag);
    } catch (error) {
      console.error('Error generating next sequence:', error);
      setValidationError('Error generating next sequence number. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Effect to generate sequence when prefix is selected
  useEffect(() => {
    if (selectedPrefix) {
      generateNextSequence(selectedPrefix);
    } else {
      setNextSequence('');
      setGeneratedTag('');
    }
  }, [selectedPrefix, userProfile?.tenant_id]);

  const handlePrefixChange = (prefixId: string) => {
    const prefix = prefixes.find(p => p.id === prefixId);
    setSelectedPrefix(prefix || null);
    setValidationError('');
  };

  const validateAndSelectTag = async () => {
    if (!selectedPrefix || !generatedTag) {
      setValidationError('Please select a prefix to generate an asset tag');
      return;
    }

    // Skip validation if this is the current tag (editing existing asset)
    if (generatedTag === currentTag) {
      onTagSelect(generatedTag);
      handleClose();
      return;
    }

    // Final validation - check if the generated tag already exists
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('id')
        .eq('asset_tag', generatedTag)
        .eq('tenant_id', userProfile?.tenant_id);

      if (error) throw error;

      if (data && data.length > 0) {
        setValidationError('Generated asset tag already exists. Please try refreshing the modal.');
        return;
      }

      onTagSelect(generatedTag);
      handleClose();
    } catch (error) {
      console.error('Error validating asset tag:', error);
      setValidationError('Error validating asset tag. Please try again.');
    }
  };

  const handleClose = () => {
    setSelectedPrefix(null);
    setNextSequence('');
    setGeneratedTag('');
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
            <Select onValueChange={handlePrefixChange}>
              <SelectTrigger id="prefix-select">
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                {prefixes.map((prefix) => (
                  <SelectItem key={prefix.id} value={prefix.id}>
                    {prefix.prefix_letter}{parseInt(prefix.number_code)} - {prefix.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isGenerating && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-gray-600">Generating next available tag...</span>
            </div>
          )}

          {generatedTag && !isGenerating && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <Label className="text-sm text-blue-800 font-medium">Generated Asset Tag:</Label>
              <div className="text-xl font-mono font-bold text-blue-900 mt-1">
                {generatedTag}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Next available sequence: {nextSequence}
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
              disabled={!generatedTag || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
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
