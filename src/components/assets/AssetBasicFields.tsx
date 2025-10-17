
import React, { useState, useEffect } from 'react';
import { Control, useWatch, useFormContext } from 'react-hook-form';
import { useAssetPrefixes } from '@/hooks/useAssetPrefixes';
import { useAssets } from '@/pages/assets/hooks/useAssets';
import { AssetNameField } from './fields/AssetNameField';
import { AssetTagField } from './fields/AssetTagField';
import { AssetCategoryField } from './fields/AssetCategoryField';
import { AssetLocationField } from './fields/AssetLocationField';
import { AssetDepartmentField } from './fields/AssetDepartmentField';
import { AssetStatusField } from './fields/AssetStatusField';
import { AssetPriorityField } from './fields/AssetPriorityField';
import { AssetTypeSelector } from './AssetTypeSelector';
import { AssetParentSelector } from './AssetParentSelector';
import type { AssetFormData, Asset } from './types';

interface AssetBasicFieldsProps {
  control: Control<AssetFormData>;
  currentAssetId?: string;
}

export const AssetBasicFields: React.FC<AssetBasicFieldsProps> = ({ control, currentAssetId }) => {
  const { prefixes } = useAssetPrefixes();
  const { assets } = useAssets();
  const [categoryManuallyEdited, setCategoryManuallyEdited] = useState(false);
  const { setValue, getFieldState } = useFormContext<AssetFormData>();
  
  // Watch the asset_tag and asset_type field values
  const assetTagValue = useWatch({
    control,
    name: 'asset_tag',
  });

  const assetTypeValue = useWatch({
    control,
    name: 'asset_type',
  });

  const categoryValue = useWatch({
    control,
    name: 'category',
  });

  // Auto-populate category when asset tag changes
  useEffect(() => {
    if (assetTagValue && !categoryManuallyEdited) {
      // Extract prefix from asset tag (e.g., "E3/001" -> "E3")
      const prefixMatch = assetTagValue.match(/^([A-Z]+\d+)/);
      if (prefixMatch) {
        const prefixCode = prefixMatch[1];
        // Find the matching prefix in our data
        const matchingPrefix = prefixes.find(prefix => {
          const singleDigitCode = parseInt(prefix.number_code).toString();
          return `${prefix.prefix_letter}${singleDigitCode}` === prefixCode;
        });
        
        if (matchingPrefix) {
          // Set the category to the prefix description
          const categoryField = getFieldState('category');
          if (!categoryField.isDirty || !categoryValue) {
            setValue('category', matchingPrefix.description);
          }
        }
      }
    }
  }, [assetTagValue, prefixes, categoryManuallyEdited, setValue, getFieldState, categoryValue]);

  const handleTagSelect = (tag: string) => {
    setCategoryManuallyEdited(false); // Reset manual edit flag when new tag is selected
  };

  const handleCategoryChange = (value: string) => {
    setCategoryManuallyEdited(true);
  };

  return (
    <>
      <AssetTypeSelector control={control} isEditing={!!currentAssetId} />
      <AssetParentSelector 
        control={control} 
        assetType={assetTypeValue || 'unit'} 
        allAssets={assets}
        currentAssetId={currentAssetId}
      />
      <AssetNameField control={control} />
      <AssetTagField control={control} onTagSelect={handleTagSelect} />
      <AssetCategoryField control={control} onCategoryChange={handleCategoryChange} />
      <AssetLocationField control={control} />
      <AssetDepartmentField control={control} />
      <AssetStatusField control={control} />
      <AssetPriorityField control={control} />
    </>
  );
};
