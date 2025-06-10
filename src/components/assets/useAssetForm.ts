
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
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
      // Log the full asset input for debugging
      console.log('Asset form submission started:', {
        formData: data,
        userProfile: userProfile,
        isEditing: isEditing,
        existingAsset: asset
      });

      // Comprehensive validation of user profile
      if (!userProfile) {
        console.error('User profile is null or undefined');
        toast({
          title: "Error",
          description: "User profile not found. Please try logging in again.",
          variant: "destructive",
        });
        return;
      }

      // Check if tenant_id exists and is valid
      if (!userProfile.tenant_id) {
        console.error('User profile missing tenant_id:', userProfile);
        toast({
          title: "Error",
          description: "User tenant information is missing. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Validate form data
      if (!data.name || data.name.trim() === '') {
        console.error('Asset name is required but missing:', data);
        toast({
          title: "Error",
          description: "Asset name is required.",
          variant: "destructive",
        });
        return;
      }

      // Construct the asset data with safe handling of optional fields
      const assetData: AssetInsert = {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        asset_tag: data.asset_tag?.trim() || null,
        serial_number: data.serial_number?.trim() || null,
        model: data.model?.trim() || null,
        manufacturer: data.manufacturer?.trim() || null,
        category: data.category?.trim() || null,
        location: data.location?.trim() || null,
        purchase_date: data.purchase_date?.trim() || null,
        purchase_cost: data.purchase_cost && data.purchase_cost.trim() ? parseFloat(data.purchase_cost) : null,
        warranty_expiry: data.warranty_expiry?.trim() || null,
        status: data.status || 'active',
        priority: data.priority || 'medium',
        notes: data.notes?.trim() || null,
        tenant_id: userProfile.tenant_id,
      };

      console.log('Constructed asset data:', assetData);

      if (isEditing) {
        // Validate asset exists for editing
        if (!asset || !asset.id) {
          console.error('Cannot edit asset: asset or asset.id is missing:', asset);
          toast({
            title: "Error",
            description: "Cannot update asset: invalid asset data.",
            variant: "destructive",
          });
          return;
        }

        // Add updated_by if user profile has an id
        if (userProfile.id) {
          assetData.updated_by = userProfile.id;
        }
        
        console.log('Attempting to update asset with ID:', asset.id);
        
        const { data: updateResult, error } = await supabase
          .from('assets')
          .update(assetData)
          .eq('id', asset.id)
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
      } else {
        // Add created_by if user profile has an id
        if (userProfile.id) {
          assetData.created_by = userProfile.id;
        }
        
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
      }

      console.log('Asset operation completed successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Form submission error details:', {
        error: error,
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        formData: data,
        userProfile: userProfile
      });
      
      // Provide more specific error messages based on the error type
      let errorMessage = "An error occurred while saving the asset";
      
      if (error?.message) {
        if (error.message.includes('tenant_id')) {
          errorMessage = "There was an issue with your account permissions. Please try logging out and back in.";
        } else if (error.message.includes('unique')) {
          errorMessage = "An asset with these details already exists. Please check your input.";
        } else if (error.message.includes('null')) {
          errorMessage = "Some required information is missing. Please check all fields and try again.";
        } else {
          errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
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
