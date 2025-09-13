import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];
type AssetInsert = Database['public']['Tables']['assets']['Insert'];

export const useAssetDuplication = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { userProfile } = useAuth();

  const duplicateAsset = async (
    originalAsset: Asset,
    keepServiceContract: boolean = false
  ): Promise<Asset | null> => {
    if (!userProfile?.tenant_id) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive",
      });
      return null;
    }

    setIsLoading(true);

    try {
      // Generate a simple sequential asset tag
      let newAssetTag = '';
      
      // Try to find existing asset tags to generate a new one
      const { data: existingAssets, error: fetchError } = await supabase
        .from('assets')
        .select('asset_tag')
        .eq('tenant_id', userProfile.tenant_id)
        .not('asset_tag', 'is', null)
        .order('asset_tag');

      if (fetchError) throw fetchError;

      // Generate a simple incremental tag if original has one
      if (originalAsset.asset_tag) {
        // Try to find a pattern or just increment
        const baseTag = originalAsset.asset_tag.replace(/\d+$/, '');
        let maxNumber = 0;
        
        existingAssets?.forEach(asset => {
          if (asset.asset_tag?.startsWith(baseTag)) {
            const match = asset.asset_tag.match(/\d+$/);
            if (match) {
              maxNumber = Math.max(maxNumber, parseInt(match[0]));
            }
          }
        });
        
        newAssetTag = `${baseTag}${maxNumber + 1}`;
      } else {
        // Generate a simple tag based on asset name
        const baseTag = originalAsset.name.substring(0, 3).toUpperCase();
        newAssetTag = `${baseTag}${Date.now().toString().slice(-4)}`;
      }

      // Prepare the duplicate asset data
      const duplicateData: AssetInsert = {
        // Copy these fields
        name: `${originalAsset.name} (Copy)`,
        description: originalAsset.description,
        model: originalAsset.model,
        manufacturer: originalAsset.manufacturer,
        manufacturer_company_id: originalAsset.manufacturer_company_id,
        category: originalAsset.category,
        location_id: originalAsset.location_id,
        department_id: originalAsset.department_id,
        purchase_date: originalAsset.purchase_date,
        purchase_cost: originalAsset.purchase_cost,
        warranty_expiry: originalAsset.warranty_expiry,
        status: originalAsset.status,
        priority: originalAsset.priority,
        notes: originalAsset.notes,

        // Generate new asset tag
        asset_tag: newAssetTag,

        // Clear these fields
        serial_number: null, // Always clear serial number

        // Conditionally handle service contract
        service_contract_id: keepServiceContract ? originalAsset.service_contract_id : null,
        id_service_contracts: keepServiceContract ? originalAsset.id_service_contracts : null,

        // Set required fields
        tenant_id: userProfile.tenant_id,
        created_by: userProfile.id,
      };

      // Insert the duplicate asset
      const { data: newAsset, error } = await supabase
        .from('assets')
        .insert(duplicateData)
        .select()
        .single();

      if (error) {
        console.error('Asset duplication error:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Asset duplicated successfully. New asset tag: ${newAssetTag}`,
      });

      return newAsset;

    } catch (error) {
      console.error('Error duplicating asset:', error);
      toast({
        title: "Error",
        description: "Failed to duplicate asset",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    duplicateAsset,
    isLoading,
  };
};