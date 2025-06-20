
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type AssetTagPrefix = Database['public']['Tables']['asset_tag_prefixes']['Row'];

export const useAssetPrefixes = () => {
  const { userProfile } = useAuth();

  const {
    data: prefixes = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['assetPrefixes', userProfile?.tenant_id],
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

  const deletePrefix = async (id: string) => {
    try {
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
      console.error('Error deleting asset prefix:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete asset tag prefix',
        variant: 'destructive',
      });
    }
  };

  return {
    prefixes,
    isLoading,
    refetch,
    deletePrefix,
  };
};
