
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { assetSchema, type Asset, type AssetFormData } from './types';
import { validateUserProfile, validateFormData, validateAssetForEditing } from './utils/validation';
import { transformFormDataToAsset } from './utils/dataTransform';
import { logError, showErrorToast } from './utils/errorHandling';
import { createAsset, updateAsset } from './utils/databaseOperations';

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

      // Validate user profile and form data
      if (!validateUserProfile(userProfile) || !validateFormData(data)) {
        return;
      }

      // Additional validation for editing
      if (isEditing && !validateAssetForEditing(asset)) {
        return;
      }

      // Transform form data to asset data
      const assetData = transformFormDataToAsset(data, userProfile!, isEditing);
      console.log('Constructed asset data:', assetData);

      // Perform database operation
      if (isEditing) {
        await updateAsset(asset!.id, assetData);
      } else {
        await createAsset(assetData);
      }

      console.log('Asset operation completed successfully');
      onSuccess();
    } catch (error: any) {
      logError(error, data, userProfile);
      showErrorToast(error);
    }
  };

  return {
    form,
    onSubmit,
    isEditing,
  };
};
