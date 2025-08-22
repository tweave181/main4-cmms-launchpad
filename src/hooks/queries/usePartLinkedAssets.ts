import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

type LinkedAsset = {
  id: string;
  name: string;
  asset_tag: string | null;
  location: string | null;
  quantity_required: number;
};

export const usePartLinkedAssets = (partId: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['part-linked-assets', partId, userProfile?.tenant_id],
    queryFn: async (): Promise<LinkedAsset[]> => {
      if (!userProfile?.tenant_id || !partId) {
        return [];
      }

      const { data, error } = await supabase
        .from('part_asset_associations')
        .select(`
          quantity_required,
          assets!fk_part_asset_associations_asset_id (
            id,
            name,
            asset_tag,
            location
          )
        `)
        .eq('part_id', partId);

      if (error) {
        console.error('Error fetching part linked assets:', error);
        throw error;
      }

      return data?.map(item => ({
        id: (item.assets as any).id,
        name: (item.assets as any).name,
        asset_tag: (item.assets as any).asset_tag,
        location: (item.assets as any).location,
        quantity_required: item.quantity_required
      })) || [];
    },
    enabled: !!userProfile?.tenant_id && !!partId,
  });
};