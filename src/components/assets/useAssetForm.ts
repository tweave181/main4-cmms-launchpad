
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';
import { assetSchema, type Asset, type AssetFormData, type AssetInsert } from './types';

interface UseAssetFormProps {
  asset?: Asset | null;
  onSuccess: () => void;
}

export const useAssetForm = ({ asset, onSuccess }: UseAssetFormProps) => {
  const { userProfile } = useAuth();
  const isEditing = !!asset;

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: asset?.name || '',
      description: asset?.description || '',
      asset_tag: asset?.asset_tag || '',
      serial_number: asset?.serial_number || '',
      model: asset?.model || '',
      manufacturer: asset?.manufacturer || '',
      category: asset?.category || '',
      location: asset?.location || '',
      purchase_date: asset?.purchase_date || '',
      purchase_cost: asset?.purchase_cost?.toString() || '',
      warranty_expiry: asset?.warranty_expiry || '',
      status: asset?.status || 'active',
      priority: asset?.priority || 'medium',
      notes: asset?.notes || '',
    },
  });

  const onSubmit = async (data: AssetFormData) => {
    try {
      // Ensure required fields are present and construct the asset data
      const assetData: AssetInsert = {
        name: data.name, // Required field, always present from form validation
        description: data.description || null,
        asset_tag: data.asset_tag || null,
        serial_number: data.serial_number || null,
        model: data.model || null,
        manufacturer: data.manufacturer || null,
        category: data.category || null,
        location: data.location || null,
        purchase_date: data.purchase_date || null,
        purchase_cost: data.purchase_cost ? parseFloat(data.purchase_cost) : null,
        warranty_expiry: data.warranty_expiry || null,
        status: data.status,
        priority: data.priority,
        notes: data.notes || null,
        tenant_id: userProfile?.tenant_id!,
      };

      if (isEditing) {
        assetData.updated_by = userProfile?.id;
        const { error } = await supabase
          .from('assets')
          .update(assetData)
          .eq('id', asset.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Asset updated successfully",
        });
      } else {
        assetData.created_by = userProfile?.id;
        const { error } = await supabase
          .from('assets')
          .insert(assetData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Asset created successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit,
    isEditing,
  };
};
