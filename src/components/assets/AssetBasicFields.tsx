

import React, { useEffect } from 'react';
import { Control, useWatch, useFormContext } from 'react-hook-form';
import { useAssets } from '@/pages/assets/hooks/useAssets';
import { AssetNameField } from './fields/AssetNameField';
import { AssetTagField } from './fields/AssetTagField';
import { AssetEquipmentCategoryField } from './fields/AssetEquipmentCategoryField';
import { AssetLocationField } from './fields/AssetLocationField';
import { AssetDepartmentField } from './fields/AssetDepartmentField';
import { AssetStatusField } from './fields/AssetStatusField';
import { AssetPriorityField } from './fields/AssetPriorityField';
import { AssetTypeSelector } from './AssetTypeSelector';
import { AssetParentSelector } from './AssetParentSelector';
import { SafeDropdownField } from './SafeDropdownField';
import { previewNextAssetTag } from '@/hooks/useEquipmentCategories';
import { toast } from '@/hooks/use-toast';
import type { AssetFormData } from './types';
import type { DropdownState } from './utils/dropdownHelpers';

interface AssetBasicFieldsProps {
  control: Control<AssetFormData>;
  currentAssetId?: string;
  serviceContractsData?: DropdownState;
}

export const AssetBasicFields: React.FC<AssetBasicFieldsProps> = ({ control, currentAssetId, serviceContractsData }) => {
  const { assets } = useAssets();
  const { setValue } = useFormContext<AssetFormData>();

  const assetTypeValue = useWatch({ control, name: 'asset_type' });
  const parentAssetValue = useWatch({ control, name: 'parent_asset_id' });
  const equipmentCategoryId = useWatch({ control, name: 'equipment_category_id' });
  const assetTagValue = useWatch({ control, name: 'asset_tag' });
  const tagManual = useWatch({ control, name: 'asset_tag_manual' });

  // Preview the next asset tag whenever an equipment category is selected on a new asset.
  // The authoritative tag is reserved on save.
  useEffect(() => {
    if (currentAssetId) return; // never re-tag an existing asset
    if (tagManual) return;
    if (!equipmentCategoryId) return;

    let cancelled = false;
    (async () => {
      try {
        const tag = await previewNextAssetTag(equipmentCategoryId);
        if (cancelled) return;
        if (!tag) {
          toast({
            title: 'Category at capacity',
            description: 'This equipment category has no asset numbers left.',
            variant: 'destructive',
          });
          return;
        }
        setValue('asset_tag', tag, { shouldDirty: false });
      } catch (error) {
        console.error('Error previewing asset tag:', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [equipmentCategoryId, currentAssetId, tagManual, setValue]);

  const handleTagSelect = () => {
    setValue('asset_tag_manual', true, { shouldDirty: false });
  };

  const handleCategoryChange = (_categoryId: string, categoryName: string) => {
    setValue('category', categoryName, { shouldDirty: true });
    if (!currentAssetId) {
      setValue('asset_tag_manual', false, { shouldDirty: false });
      setValue('asset_tag', '', { shouldDirty: false });
    }
  };

  return (
    <>
      <AssetTypeSelector 
        control={control} 
        isEditing={!!currentAssetId}
        disabled={!!parentAssetValue}
      />
      <AssetParentSelector 
        control={control} 
        assetType={assetTypeValue || 'unit'} 
        allAssets={assets}
        currentAssetId={currentAssetId}
        disabled={!!parentAssetValue}
      />
      <AssetNameField control={control} />
      <AssetEquipmentCategoryField control={control} onCategoryChange={handleCategoryChange} />
      <AssetTagField control={control} onTagSelect={handleTagSelect} />
      <AssetLocationField control={control} />
      <AssetDepartmentField control={control} />
      <AssetStatusField control={control} />
      <AssetPriorityField control={control} />
      {serviceContractsData && (
        <SafeDropdownField
          control={control}
          name="service_contract_id"
          label="Service Contract"
          placeholder="Select service contract"
          options={serviceContractsData.data}
          isLoading={serviceContractsData.isLoading}
          error={serviceContractsData.error}
        />
      )}
    </>
  );
};
