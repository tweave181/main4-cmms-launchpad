import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import { handleError } from '@/utils/errorHandling';
import type { Database } from '@/integrations/supabase/types';

type AssetTagPrefix = Database['public']['Tables']['asset_tag_prefixes']['Row'];

interface AssetPrefixWithCount extends AssetTagPrefix {
  asset_count: number;
  is_at_capacity: boolean;
  is_archived?: boolean;
}

export const useAssetPrefixes = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: prefixes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['assetPrefixes', userProfile?.tenant_id],
    queryFn: async () => {
      // First, get all asset tag prefixes with categories
      const { data: prefixData, error: prefixError } = await supabase
        .from('asset_tag_prefixes')
        .select(`
          *,
          category:categories(
            id,
            name,
            description
          )
        `)
        .order('prefix_letter', { ascending: true })
        .order('number_code', { ascending: true });

      if (prefixError) throw prefixError;

      // Then, get all assets to count usage
      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select('asset_tag')
        .eq('tenant_id', userProfile?.tenant_id);

      if (assetsError) throw assetsError;

      // Calculate asset counts for each prefix
      const prefixesWithCount: AssetPrefixWithCount[] = prefixData.map(prefix => {
        const singleDigitCode = parseInt(prefix.number_code).toString();
        const basePattern = `${prefix.prefix_letter}${singleDigitCode}/`;
        
        const assetCount = assetsData?.filter(asset => 
          asset.asset_tag && asset.asset_tag.startsWith(basePattern)
        ).length || 0;

        return {
          ...prefix,
          asset_count: assetCount,
          is_at_capacity: assetCount >= 999,
          is_archived: false // TODO: Add archived field to database if needed
        };
      });

      return prefixesWithCount;
    },
    enabled: !!userProfile?.tenant_id,
  });

  const deletePrefix = async (id: string) => {
    try {
      // Check if prefix is still in use
      const prefixToDelete = prefixes.find(p => p.id === id);
      if (prefixToDelete && prefixToDelete.asset_count > 0) {
        toast({
          title: 'Cannot Delete Prefix',
          description: `This prefix is currently used by ${prefixToDelete.asset_count} asset(s). Please reassign or remove these assets first.`,
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('asset_tag_prefixes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Asset tag prefix deleted successfully',
      });

      refetch();
    } catch (error) {
      handleError(error, 'useAssetPrefixes:deletePrefix', {
        showToast: true,
        toastTitle: "Failed to Delete Prefix",
        additionalData: { prefixId: id },
      });
    }
  };

  // Get available prefixes for asset tag generation (exclude at-capacity and archived)
  const getAvailablePrefixes = () => {
    return prefixes.filter(prefix => !prefix.is_at_capacity && !prefix.is_archived);
  };

  const importPrefixes = useMutation({
    mutationFn: async (prefixesData: {
      prefix_letter: string;
      number_code: string;
      category_id?: string;
      description: string;
    }[]) => {
      if (!userProfile?.tenant_id) throw new Error('Tenant not found');

      const { data, error } = await supabase
        .from('asset_tag_prefixes')
        .insert(prefixesData.map(p => ({
          tenant_id: userProfile.tenant_id,
          prefix_letter: p.prefix_letter.toUpperCase(),
          number_code: p.number_code.padStart(3, '0'),
          category_id: p.category_id || null,
          description: p.description,
        })))
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['unlinkedCategories'] });
      toast({
        title: 'Success',
        description: `${data.length} prefix${data.length === 1 ? '' : 'es'} imported successfully`,
      });
    },
    onError: (error) => {
      console.error('Error importing prefixes:', error);
      toast({
        title: 'Import Failed',
        description: 'Failed to import prefixes',
        variant: 'destructive',
      });
    },
  });

  return {
    prefixes,
    isLoading,
    refetch,
    deletePrefix,
    getAvailablePrefixes,
    importPrefixes,
  };
};
