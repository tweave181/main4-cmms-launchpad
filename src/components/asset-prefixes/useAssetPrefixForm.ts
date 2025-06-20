
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AssetTagPrefix = Database['public']['Tables']['asset_tag_prefixes']['Row'];

const assetPrefixSchema = z.object({
  prefix_letter: z.string()
    .min(1, 'Prefix letter is required')
    .max(1, 'Prefix letter must be a single character')
    .regex(/^[A-Z]$/, 'Prefix letter must be a single uppercase letter'),
  number_code: z.string()
    .min(3, 'Number code must be 3 digits')
    .max(3, 'Number code must be 3 digits')
    .regex(/^[0-9]{3}$/, 'Number code must be exactly 3 digits'),
  description: z.string()
    .min(1, 'Description is required')
    .max(100, 'Description must be less than 100 characters'),
});

export type AssetPrefixFormData = z.infer<typeof assetPrefixSchema>;

interface UseAssetPrefixFormProps {
  prefix?: AssetTagPrefix | null;
  onSuccess: () => void;
}

export const useAssetPrefixForm = ({ prefix, onSuccess }: UseAssetPrefixFormProps) => {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!prefix;

  const form = useForm<AssetPrefixFormData>({
    resolver: zodResolver(assetPrefixSchema),
    defaultValues: {
      prefix_letter: prefix?.prefix_letter || '',
      number_code: prefix?.number_code || '',
      description: prefix?.description || '',
    },
  });

  const onSubmit = async (data: AssetPrefixFormData) => {
    if (!userProfile?.tenant_id) {
      toast({
        title: 'Error',
        description: 'User profile not found',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && prefix) {
        // Update existing prefix
        const { error } = await supabase
          .from('asset_tag_prefixes')
          .update({
            prefix_letter: data.prefix_letter,
            number_code: data.number_code,
            description: data.description,
          })
          .eq('id', prefix.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Asset tag prefix updated successfully',
        });
      } else {
        // Create new prefix
        const { error } = await supabase
          .from('asset_tag_prefixes')
          .insert({
            tenant_id: userProfile.tenant_id,
            prefix_letter: data.prefix_letter,
            number_code: data.number_code,
            description: data.description,
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Asset tag prefix created successfully',
        });
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving asset prefix:', error);
      
      // Check for unique constraint violation
      if (error instanceof Error && error.message.includes('unique')) {
        toast({
          title: 'Error',
          description: 'A prefix with this letter and code combination already exists',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: `Failed to ${isEditing ? 'update' : 'create'} asset tag prefix`,
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    onSubmit,
    isEditing,
    isLoading,
  };
};
