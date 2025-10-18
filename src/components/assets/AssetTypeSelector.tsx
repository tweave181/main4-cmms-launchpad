import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Control } from 'react-hook-form';
import type { AssetFormData } from './types';
import { Building2, Settings, Package } from 'lucide-react';

interface AssetTypeSelectorProps {
  control: Control<AssetFormData>;
  isEditing?: boolean;
  disabled?: boolean;
}

export const AssetTypeSelector: React.FC<AssetTypeSelectorProps> = ({
  control,
  isEditing = false,
  disabled = false
}) => {
  return (
    <FormField
      control={control}
      name="asset_type"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Asset Type *</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select asset type..." />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="unit">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Unit</div>
                    <div className="text-xs text-muted-foreground">
                      Top-level equipment (Chiller, AHU, Boiler)
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="component">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Component</div>
                    <div className="text-xs text-muted-foreground">
                      Parts of units (Fan, Compressor, Controls)
                    </div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem value="consumable">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium">Consumable</div>
                    <div className="text-xs text-muted-foreground">
                      Replaceable items (Filter, Belt, Oil, Fuse)
                    </div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {isEditing && (
            <FormDescription className="text-amber-600">
              ⚠️ Changing asset type will update its hierarchy level. Ensure this asset has no child assets before changing.
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
