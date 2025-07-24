
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SafeDropdownField } from './SafeDropdownField';
import { AssetStatusField } from './fields/AssetStatusField';
import { AssetPriorityField } from './fields/AssetPriorityField';
import type { AssetFormData } from './types';
import type { DropdownState } from './utils/dropdownHelpers';

interface AssetTechnicalFieldsProps {
  control: Control<AssetFormData>;
  companiesData: DropdownState;
}

export const AssetTechnicalFields: React.FC<AssetTechnicalFieldsProps> = ({ 
  control, 
  companiesData 
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="serial_number"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Serial Number</FormLabel>
            <FormControl>
              <Input placeholder="Enter serial number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Model</FormLabel>
            <FormControl>
              <Input placeholder="Enter model" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="manufacturer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Manufacturer</FormLabel>
            <FormControl>
              <Input placeholder="Enter manufacturer" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <SafeDropdownField
        control={control}
        name="manufacturer_company_id"
        label="Manufacturer Company"
        placeholder="Select manufacturer company"
        options={companiesData.data}
        isLoading={companiesData.isLoading}
        error={companiesData.error}
      />

      <AssetStatusField control={control} />

      <AssetPriorityField control={control} />
    </div>
  );
};
