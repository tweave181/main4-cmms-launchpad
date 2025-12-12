
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export interface BulkPrefixData {
  category_id: string;
  prefix_letter: string;
  number_code: string;
  description: string;
}

export const useBulkPrefixSave = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prefixes: BulkPrefixData[]) => {
      if (!userProfile?.tenant_id) {
        throw new Error('User not authenticated');
      }

      // Format data for insertion
      const insertData = prefixes.map(p => ({
        tenant_id: userProfile.tenant_id,
        category_id: p.category_id,
        prefix_letter: p.prefix_letter.toUpperCase(),
        number_code: p.number_code.padStart(3, '0'),
        description: p.description,
      }));

      const { data, error } = await supabase
        .from('asset_tag_prefixes')
        .insert(insertData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assetPrefixes'] });
      queryClient.invalidateQueries({ queryKey: ['unlinkedCategories'] });
      queryClient.invalidateQueries({ queryKey: ['tenantSetupStatus'] });
      toast.success(`Created ${data.length} asset tag prefix${data.length > 1 ? 'es' : ''}`);
    },
    onError: (error) => {
      console.error('Error creating prefixes:', error);
      toast.error('Failed to create prefixes. Check for duplicate combinations.');
    },
  });
};
