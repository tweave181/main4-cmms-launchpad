
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
import type { AssetFormData } from '../types';

interface AssetCategoryFieldProps {
  control: Control<AssetFormData>;
  onCategoryChange: (value: string) => void;
}

export const AssetCategoryField: React.FC<AssetCategoryFieldProps> = ({ 
  control, 
  onCategoryChange 
}) => {
  return (
    <FormField
      control={control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter category" 
              {...field}
              onChange={(e) => {
                field.onChange(e);
                onCategoryChange(e.target.value);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
