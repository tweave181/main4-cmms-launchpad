
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
      // Ensure user profile and tenant_id are available
      if (!userProfile?.tenant_id) {
        toast({
          title: "Error",
          description: "User profile not found. Please try logging in again.",
          variant: "destructive",
        });
        return;
      }

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
        tenant_id: userProfile.tenant_id, // Always set the tenant_id from user profile
      };

      if (isEditing) {
        // For updates, include updated_by
        if (userProfile.id) {
          assetData.updated_by = userProfile.id;
        }
        
        const { error } = await supabase
          .from('assets')
          .update(assetData)
          .eq('id', asset.id);

        if (error) {
          console.error('Asset update error:', error);
          throw error;
        }

        toast({
          title: "Success",
          description: "Asset updated successfully",
        });
      } else {
        // For inserts, include created_by
        if (userProfile.id) {
          assetData.created_by = userProfile.id;
        }
        
        const { error } = await supabase
          .from('assets')
          .insert(assetData);

        if (error) {
          console.error('Asset creation error:', error);
          throw error;
        }

        toast({
          title: "Success",
          description: "Asset created successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while saving the asset",
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
