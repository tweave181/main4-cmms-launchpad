
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/auth';
import { assetSchema, type Asset, type AssetFormData } from './types';
import { validateUserProfile, validateFormData, validateAssetForEditing, validateAssetTypeChange } from './utils/validation';
import { transformFormDataToAsset } from './utils/dataTransform';
import { logError, showErrorToast } from './utils/errorHandling';
import { createAsset, updateAsset } from './utils/databaseOperations';
import { useState } from 'react';

interface UseAssetFormProps {
  asset?: Asset | null;
  onSuccess: () => void;
}

export const useAssetForm = ({ asset, onSuccess }: UseAssetFormProps) => {
  const { userProfile } = useAuth();
  const isEditing = !!asset;
  const [showTypeChangeConfirm, setShowTypeChangeConfirm] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<AssetFormData | null>(null);

  const form = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      name: asset?.name || '',
      description: asset?.description || '',
      asset_tag: asset?.asset_tag || '',
      serial_number: asset?.serial_number || '',
      model: asset?.model || '',
      manufacturer_company_id: asset?.manufacturer_company_id || '',
      category: asset?.category || '',
      location_id: asset?.location_id || '',
      department_id: asset?.department_id || '',
      purchase_date: asset?.purchase_date || '',
      purchase_cost: asset?.purchase_cost?.toString() || '',
      warranty_expiry: asset?.warranty_expiry || '',
      status: asset?.status || 'active',
      priority: asset?.priority || 'medium',
      notes: asset?.notes || '',
      service_contract_id: asset?.service_contract_id || '',
      parent_asset_id: asset?.parent_asset_id || '',
      asset_type: asset?.asset_type || 'unit',
    },
  });

  const confirmTypeChange = async () => {
    if (!pendingFormData) return;
    
    setShowTypeChangeConfirm(false);
    await processSubmit(pendingFormData);
    setPendingFormData(null);
  };

  const cancelTypeChange = () => {
    setShowTypeChangeConfirm(false);
    setPendingFormData(null);
  };

  const processSubmit = async (data: AssetFormData) => {
    try {
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

      // Transform form data to asset data with defensive programming
      const assetData = transformFormDataToAsset(data, userProfile!, isEditing);
      console.log('Constructed asset data:', assetData);

      // Perform database operation with enhanced error handling
      try {
        if (isEditing) {
          await updateAsset(asset!.id, assetData);
        } else {
          await createAsset(assetData);
        }
        
        console.log('Asset operation completed successfully');
        onSuccess();
      } catch (dbError: any) {
        console.error('Database operation failed:', dbError);
        throw dbError;
      }
    } catch (error: any) {
      console.error('Asset form submission failed:', error);
      logError(error, data, userProfile);
      showErrorToast(error);
    }
  };

  const onSubmit = async (data: AssetFormData) => {
    // Check if asset type is changing on an existing asset
    if (isEditing && asset && data.asset_type !== asset.asset_type) {
      // Validate the type change
      if (!validateAssetTypeChange(asset, data.asset_type)) {
        return;
      }
      
      // Show confirmation dialog
      setPendingFormData(data);
      setShowTypeChangeConfirm(true);
      return;
    }

    // If not changing type or creating new, process immediately
    await processSubmit(data);
  };

  return {
    form,
    onSubmit,
    isEditing,
    showTypeChangeConfirm,
    confirmTypeChange,
    cancelTypeChange,
  };
};
