

import React, { useState, useEffect, useRef } from 'react';
import { Control, useWatch, useFormContext } from 'react-hook-form';
import { useAssetPrefixes } from '@/hooks/useAssetPrefixes';
import { useAssets } from '@/pages/assets/hooks/useAssets';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { AssetNameField } from './fields/AssetNameField';
import { AssetTagField } from './fields/AssetTagField';
import { AssetCategoryField } from './fields/AssetCategoryField';
import { AssetLocationField } from './fields/AssetLocationField';
import { AssetDepartmentField } from './fields/AssetDepartmentField';
import { AssetStatusField } from './fields/AssetStatusField';
import { AssetPriorityField } from './fields/AssetPriorityField';
import { AssetTypeSelector } from './AssetTypeSelector';
import { AssetParentSelector } from './AssetParentSelector';
import { SafeDropdownField } from './SafeDropdownField';
import { toast } from '@/hooks/use-toast';
import type { AssetFormData, Asset } from './types';
import type { DropdownState } from './utils/dropdownHelpers';

interface AssetBasicFieldsProps {
  control: Control<AssetFormData>;
  currentAssetId?: string;
  serviceContractsData?: DropdownState;
}

export const AssetBasicFields: React.FC<AssetBasicFieldsProps> = ({ control, currentAssetId, serviceContractsData }) => {
  const { prefixes } = useAssetPrefixes();
  const { assets } = useAssets();
  const { userProfile } = useAuth();
  const [categoryManuallyEdited, setCategoryManuallyEdited] = useState(false);
  const [tagManuallyEdited, setTagManuallyEdited] = useState(false);
  const suggestingForCategoryRef = useRef<string | null>(null);
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

  const parentAssetValue = useWatch({
    control,
    name: 'parent_asset_id',
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

  // Auto-suggest asset tag when category changes (only if tag is empty and not editing)
  useEffect(() => {
    if (currentAssetId) return; // don't suggest when editing existing asset
    if (tagManuallyEdited) return;
    if (!categoryValue || !userProfile?.tenant_id) return;
    if (assetTagValue) return; // don't overwrite an existing tag
    if (suggestingForCategoryRef.current === categoryValue) return;

    // Find prefix matching this category (by linked category name or fallback description)
    const matchingPrefix = prefixes.find((p: any) => {
      const linkedName = p.category?.name;
      return (
        !p.is_at_capacity &&
        ((linkedName && linkedName === categoryValue) || p.description === categoryValue)
      );
    });

    if (!matchingPrefix) return;

    suggestingForCategoryRef.current = categoryValue;

    const singleDigitCode = parseInt(matchingPrefix.number_code).toString();
    const basePattern = `${matchingPrefix.prefix_letter}${singleDigitCode}/`;

    (async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('asset_tag')
        .eq('tenant_id', userProfile.tenant_id)
        .like('asset_tag', `${basePattern}%`);

      if (error) {
        console.error('Error suggesting asset tag:', error);
        return;
      }

      let maxSequence = 0;
      const re = new RegExp(`^${matchingPrefix.prefix_letter}${singleDigitCode}/([0-9]{3})$`);
      (data || []).forEach((a) => {
        if (a.asset_tag) {
          const m = a.asset_tag.match(re);
          if (m) {
            const n = parseInt(m[1]);
            if (n > maxSequence) maxSequence = n;
          }
        }
      });

      if (maxSequence >= 999) {
        toast({
          title: 'Prefix at capacity',
          description: `Prefix ${matchingPrefix.prefix_letter}${singleDigitCode} has reached 999 assets.`,
          variant: 'destructive',
        });
        return;
      }

      const nextSeq = (maxSequence + 1).toString().padStart(3, '0');
      const suggestedTag = `${basePattern}${nextSeq}`;
      setValue('asset_tag', suggestedTag, { shouldDirty: false });
    })();
  }, [categoryValue, prefixes, userProfile?.tenant_id, assetTagValue, tagManuallyEdited, currentAssetId, setValue]);

  const handleTagSelect = (tag: string) => {
    setCategoryManuallyEdited(false); // Reset manual edit flag when new tag is selected
    setTagManuallyEdited(true); // user picked a tag explicitly
  };

  const handleCategoryChange = (value: string) => {
    setCategoryManuallyEdited(true);
    // Allow a new suggestion when category changes
    setTagManuallyEdited(false);
    suggestingForCategoryRef.current = null;
    // Clear stale auto-suggested tag so the effect can fill the new one
    setValue('asset_tag', '', { shouldDirty: false });
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
      <AssetCategoryField control={control} onCategoryChange={handleCategoryChange} />
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
