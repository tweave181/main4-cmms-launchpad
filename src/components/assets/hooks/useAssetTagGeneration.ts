
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface AssetTagPrefix {
  id: string;
  prefix_letter: string;
  number_code: string;
  description: string;
}

export const useAssetTagGeneration = () => {
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

  const validateAndSelectTag = async (currentTag: string, onTagSelect: (tag: string) => void) => {
    if (!selectedPrefix || !generatedTag) {
      setValidationError('Please select a prefix to generate an asset tag');
      return false;
    }

    // Skip validation if this is the current tag (editing existing asset)
    if (generatedTag === currentTag) {
      onTagSelect(generatedTag);
      return true;
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
        return false;
      }

      onTagSelect(generatedTag);
      return true;
    } catch (error) {
      console.error('Error validating asset tag:', error);
      setValidationError('Error validating asset tag. Please try again.');
      return false;
    }
  };

  const resetState = () => {
    setSelectedPrefix(null);
    setNextSequence('');
    setGeneratedTag('');
    setValidationError('');
  };

  return {
    prefixes,
    isLoading,
    selectedPrefix,
    setSelectedPrefix,
    nextSequence,
    generatedTag,
    isGenerating,
    validationError,
    setValidationError,
    validateAndSelectTag,
    resetState,
  };
};
