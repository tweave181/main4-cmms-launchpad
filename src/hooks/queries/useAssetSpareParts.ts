import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useToast } from '@/hooks/use-toast';

type AssetSparePart = {
  part_id: string;
  name: string;
  sku: string;
  quantity_required: number;
  unit_of_measure?: string;
};

type AddAssetPartData = {
  assetId: string;
  partId: string;
  quantityRequired: number;
};

type UpdateAssetPartData = {
  assetId: string;
  partId: string;
  quantityRequired: number;
};

type DeleteAssetPartData = {
  assetId: string;
  partId: string;
};

// Fetch spare parts for an asset
export const useAssetSpareParts = (assetId: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['asset-spare-parts', assetId, userProfile?.tenant_id],
    queryFn: async (): Promise<AssetSparePart[]> => {
      if (!userProfile?.tenant_id || !assetId) {
        return [];
      }

      const { data, error } = await supabase
        .from('part_asset_associations')
        .select(`
          part_id,
          quantity_required,
          inventory_parts!fk_part_asset_associations_part_id (
            name,
            sku,
            unit_of_measure
          )
        `)
        .eq('asset_id', assetId);

      if (error) {
        console.error('Error fetching asset spare parts:', error);
        throw error;
      }

      return data?.map(item => ({
        part_id: item.part_id,
        name: (item.inventory_parts as any).name,
        sku: (item.inventory_parts as any).sku,
        quantity_required: item.quantity_required,
        unit_of_measure: (item.inventory_parts as any).unit_of_measure
      })) || [];
    },
    enabled: !!userProfile?.tenant_id && !!assetId,
  });
};

// Add or update spare part for an asset (upsert)
export const useAddAssetSparePart = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ assetId, partId, quantityRequired }: AddAssetPartData) => {
      // Try to insert first, if it fails due to unique constraint, update instead
      const { data: insertData, error: insertError } = await supabase
        .from('part_asset_associations')
        .insert({
          asset_id: assetId,
          part_id: partId,
          quantity_required: quantityRequired
        })
        .select()
        .single();

      if (insertError) {
        // Check if it's a unique constraint violation
        if (insertError.code === '23505') {
          // Update existing record instead
          const { data: updateData, error: updateError } = await supabase
            .from('part_asset_associations')
            .update({ quantity_required: quantityRequired })
            .eq('asset_id', assetId)
            .eq('part_id', partId)
            .select()
            .single();

          if (updateError) {
            throw updateError;
          }
          return updateData;
        }
        throw insertError;
      }

      return insertData;
    },
    onSuccess: (_, { assetId }) => {
      queryClient.invalidateQueries({ queryKey: ['asset-spare-parts', assetId] });
    },
  });
};

// Update spare part quantity for an asset
export const useUpdateAssetSparePart = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ assetId, partId, quantityRequired }: UpdateAssetPartData) => {
      const { data, error } = await supabase
        .from('part_asset_associations')
        .update({ quantity_required: quantityRequired })
        .eq('asset_id', assetId)
        .eq('part_id', partId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (_, { assetId }) => {
      queryClient.invalidateQueries({ queryKey: ['asset-spare-parts', assetId] });
    },
  });
};

// Delete spare part association for an asset
export const useDeleteAssetSparePart = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ assetId, partId }: DeleteAssetPartData) => {
      const { error } = await supabase
        .from('part_asset_associations')
        .delete()
        .eq('asset_id', assetId)
        .eq('part_id', partId);

      if (error) {
        throw error;
      }

      return { assetId, partId };
    },
    onSuccess: (_, { assetId }) => {
      queryClient.invalidateQueries({ queryKey: ['asset-spare-parts', assetId] });
    },
  });
};