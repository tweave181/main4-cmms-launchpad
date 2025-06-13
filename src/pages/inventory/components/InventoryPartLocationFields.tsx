
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

interface FormData {
  name: string;
  description?: string;
  sku: string;
  category?: string;
  quantity_in_stock: number;
  reorder_threshold: number;
  unit_of_measure: 'pieces' | 'kg' | 'lbs' | 'liters' | 'gallons' | 'meters' | 'feet' | 'hours';
  storage_locations?: string;
  linked_asset_type?: string;
}

interface InventoryPartLocationFieldsProps {
  control: Control<FormData>;
}

export const InventoryPartLocationFields: React.FC<InventoryPartLocationFieldsProps> = ({
  control,
}) => {
  return (
    <>
      <FormField
        control={control}
        name="storage_locations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Storage Locations</FormLabel>
            <FormControl>
              <Input placeholder="Enter locations (comma separated)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="linked_asset_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Linked Asset Type</FormLabel>
            <FormControl>
              <Input placeholder="Enter asset type" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
