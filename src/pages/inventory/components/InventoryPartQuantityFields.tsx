
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
import type { FormData } from './useInventoryPartForm';

interface InventoryPartQuantityFieldsProps {
  control: Control<FormData>;
}

export const InventoryPartQuantityFields: React.FC<InventoryPartQuantityFieldsProps> = ({
  control,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="quantity_in_stock"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quantity in Stock</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0" 
                {...field} 
                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="reorder_threshold"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Reorder Threshold</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0" 
                {...field} 
                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
