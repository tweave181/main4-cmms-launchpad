import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import type { AssetFormData, Asset } from './types';
import { getAvailableParents, getAssetBreadcrumb } from '@/utils/assetHierarchyUtils';

interface AssetParentSelectorProps {
  control: Control<AssetFormData>;
  assetType: 'unit' | 'component' | 'consumable';
  allAssets: Asset[];
  currentAssetId?: string;
  disabled?: boolean;
}

export const AssetParentSelector: React.FC<AssetParentSelectorProps> = ({
  control,
  assetType,
  allAssets,
  currentAssetId,
  disabled = false
}) => {
  const availableParents = getAvailableParents(assetType, allAssets, currentAssetId);

  // Units don't have parents
  if (assetType === 'unit') {
    return null;
  }

  const parentLabel = assetType === 'component' ? 'Parent Unit' : 'Parent Component';

  return (
    <FormField
      control={control}
      name="parent_asset_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{parentLabel} *</FormLabel>
          <Select onValueChange={field.onChange} value={field.value || ''} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${parentLabel.toLowerCase()}...`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availableParents.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No available {parentLabel.toLowerCase()}s found
                </div>
              ) : (
                availableParents.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{asset.name}</span>
                      {asset.asset_tag && (
                        <span className="text-xs text-muted-foreground">
                          {asset.asset_tag}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
