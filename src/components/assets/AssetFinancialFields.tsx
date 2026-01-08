

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
import type { AssetFormData } from './types';

interface AssetFinancialFieldsProps {
  control: Control<AssetFormData>;
}

export const AssetFinancialFields: React.FC<AssetFinancialFieldsProps> = ({ 
  control
}) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="purchase_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purchase Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="purchase_cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purchase Cost</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Enter purchase cost" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="warranty_expiry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Warranty Expiry</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
