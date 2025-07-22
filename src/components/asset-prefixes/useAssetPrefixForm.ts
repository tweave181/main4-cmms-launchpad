
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import { useDuplicateCheck } from './hooks/useDuplicateCheck';
import type { Database } from '@/integrations/supabase/types';

type AssetTagPrefix = Database['public']['Tables']['asset_tag_prefixes']['Row'];

const assetPrefixSchema = z.object({
  prefix_letter: z.string()
    .min(1, 'Prefix letter is required')
    .max(1, 'Prefix letter must be a single character')
    .regex(/^[A-Z]$/, 'Prefix letter must be a single uppercase letter'),
  number_code: z.string()
    .min(1, 'Number code is required')
    .regex(/^[1-9]\d{0,2}$/, 'Number code must be between 1 and 999')
    .refine((val) => {
      const num = parseInt(val);
      return num >= 1 && num <= 999;
    }, 'Number code must be between 1 and 999')
    .transform((val) => parseInt(val).toString().padStart(3, '0')),
  description: z.string()
    .min(1, 'Description is required')
    .max(100, 'Description must be less than 100 characters'),
  category_id: z.string().nullable().optional(),
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

  console.log('useAssetPrefixForm initialized with:', { isEditing, prefix });

  // Check if the current prefix is in use by existing assets
  const { data: isPrefixInUse = false } = useQuery({
    queryKey: ['prefixInUse', prefix?.id, userProfile?.tenant_id],
    queryFn: async () => {
      if (!prefix || !userProfile?.tenant_id) return false;
      
      const singleDigitCode = parseInt(prefix.number_code).toString();
      const basePattern = `${prefix.prefix_letter}${singleDigitCode}/`;
      
      const { data, error } = await supabase
        .from('assets')
        .select('id')
        .eq('tenant_id', userProfile.tenant_id)
        .like('asset_tag', `${basePattern}%`)
        .limit(1);

      if (error) throw error;
      
      return (data && data.length > 0);
    },
    enabled: isEditing && !!prefix && !!userProfile?.tenant_id,
  });

  const form = useForm<AssetPrefixFormData>({
    resolver: zodResolver(assetPrefixSchema),
    defaultValues: {
      prefix_letter: '',
      number_code: '',
      description: '',
      category_id: null,
    },
  });

  // Reset form when prefix changes
  useEffect(() => {
    console.log('Form reset triggered, prefix:', prefix);
    if (prefix) {
      form.reset({
        prefix_letter: prefix.prefix_letter || '',
        number_code: prefix.number_code ? parseInt(prefix.number_code).toString() : '',
        description: prefix.description || '',
        category_id: prefix.category_id || null,
      });
    } else {
      form.reset({
        prefix_letter: '',
        number_code: '',
        description: '',
        category_id: null,
      });
    }
  }, [prefix, form]);

  // Watch form values for duplicate checking
  const watchedValues = form.watch();
  
  // Check for duplicates
  const { data: isDuplicate = false } = useDuplicateCheck({
    prefixLetter: watchedValues.prefix_letter || '',
    numberCode: watchedValues.number_code || '',
    excludeId: prefix?.id,
  });

  // Add duplicate validation to form
  const validateNoDuplicate = () => {
    if (isDuplicate) {
      form.setError('number_code', {
        type: 'manual',
        message: 'This prefix letter and number combination already exists',
      });
      return false;
    }
    return true;
  };

  const onSubmit = async (data: AssetPrefixFormData) => {
    console.log('Form submission started with data:', data);
    
    if (!userProfile?.tenant_id) {
      toast({
        title: 'Error',
        description: 'User profile not found',
        variant: 'destructive',
      });
      return;
    }

    // Check for duplicates before submission
    if (!validateNoDuplicate()) {
      console.log('Duplicate validation failed');
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing && prefix) {
        console.log('Updating existing prefix:', prefix.id);
        // Update existing prefix
        const { error } = await supabase
          .from('asset_tag_prefixes')
          .update({
            prefix_letter: data.prefix_letter,
            number_code: data.number_code,
            description: data.description,
            category_id: data.category_id || null,
          })
          .eq('id', prefix.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }

        console.log('Update successful');
        toast({
          title: 'Success',
          description: 'Asset tag prefix updated successfully',
        });
      } else {
        console.log('Creating new prefix');
        // Create new prefix
        const { error } = await supabase
          .from('asset_tag_prefixes')
          .insert({
            tenant_id: userProfile.tenant_id,
            prefix_letter: data.prefix_letter,
            number_code: data.number_code,
            description: data.description,
            category_id: data.category_id || null,
          });

        if (error) {
          console.error('Create error:', error);
          throw error;
        }

        console.log('Create successful');
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
    isPrefixInUse,
    isDuplicate,
    validateNoDuplicate,
  };
};
