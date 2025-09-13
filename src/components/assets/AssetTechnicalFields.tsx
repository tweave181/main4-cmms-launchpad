
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
import { ManufacturerField } from './fields/ManufacturerField';
import type { AssetFormData } from './types';

interface AssetTechnicalFieldsProps {
  control: Control<AssetFormData>;
}

export const AssetTechnicalFields: React.FC<AssetTechnicalFieldsProps> = ({ 
  control 
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

      <ManufacturerField control={control} />
    </div>
  );
};
