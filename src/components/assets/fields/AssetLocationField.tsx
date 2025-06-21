
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

interface AssetLocationFieldProps {
  control: Control<AssetFormData>;
}

export const AssetLocationField: React.FC<AssetLocationFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Location</FormLabel>
          <FormControl>
            <Input placeholder="Enter location" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
