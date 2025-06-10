
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { AssetInsert, Asset } from '../types';

export const createAsset = async (assetData: AssetInsert): Promise<void> => {
  console.log('Attempting to create new asset');
  
  const { data: insertResult, error } = await supabase
    .from('assets')
    .insert(assetData)
    .select();

  console.log('Insert result:', { insertResult, error });

  if (error) {
    console.error('Asset creation error:', error);
    throw error;
  }

  toast({
    title: "Success",
    description: "Asset created successfully",
  });
};

export const updateAsset = async (assetId: string, assetData: AssetInsert): Promise<void> => {
  console.log('Attempting to update asset with ID:', assetId);
  
  const { data: updateResult, error } = await supabase
    .from('assets')
    .update(assetData)
    .eq('id', assetId)
    .select();

  console.log('Update result:', { updateResult, error });

  if (error) {
    console.error('Asset update error:', error);
    throw error;
  }

  toast({
    title: "Success",
    description: "Asset updated successfully",
  });
};
