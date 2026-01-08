
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import type { Asset } from '@/components/assets/types';
import { handleError, getErrorMessage } from '@/utils/errorHandling';

export const useAssets = () => {
  const { userProfile } = useAuth();

  const { data: assets, isLoading, refetch, error } = useQuery({
    queryKey: ['assets', userProfile?.tenant_id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('assets')
          .select(`
            *,
            department:departments(name),
            location:locations(name, location_code, location_level_id, location_level_data:location_levels(id, name, code)),
            manufacturer_company:company_details(company_name),
            service_contract:service_contracts(id, contract_title, vendor_name, status, start_date, end_date),
            parent:assets!parent_asset_id(id, name, asset_tag),
            children:assets!parent_asset_id(id, name, asset_tag, asset_type, asset_level)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          if (
            error.code === "401" ||
            error.code === "403" ||
            error.code === "400" ||
            (typeof error.message === "string" &&
              (error.message.toLowerCase().includes("token") ||
                error.message.toLowerCase().includes("refresh") ||
                error.message.toLowerCase().includes("expired") ||
                error.message.toLowerCase().includes("session"))
            )
          ) {
            throw new Error("Session expired. Please sign in again.");
          }
          throw error;
        }
        
        // Transform database result to Asset type
        return (data || []).map((asset: any) => ({
          ...asset,
          asset_level: asset.asset_level as 1 | 2 | 3,
          asset_type: asset.asset_type as 'unit' | 'component' | 'consumable',
          children: Array.isArray(asset.children) ? asset.children : (asset.children ? [asset.children] : [])
        })) as Asset[];
      } catch (err) {
        throw err;
      }
    },
    enabled: !!userProfile?.tenant_id,
    retry: (failureCount, err: unknown) => {
      const errorMessage = getErrorMessage(err);
      if (
        errorMessage &&
        (
          errorMessage.includes("expired") ||
          errorMessage.includes("sign in") ||
          errorMessage.includes("401") ||
          errorMessage.includes("forbidden")
        )
      ) {
        return false;
      }
      return failureCount < 2;
    }
  });

  const deleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;

    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Asset deleted successfully",
      });
      refetch();
    } catch (error) {
      handleError(error, 'useAssets:deleteAsset', {
        showToast: true,
        toastTitle: "Failed to Delete Asset",
        additionalData: { assetId },
      });
    }
  };

  return {
    assets: assets || [],
    isLoading,
    refetch,
    deleteAsset,
    error,
  };
};
