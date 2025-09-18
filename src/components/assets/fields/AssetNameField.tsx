
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

interface AssetNameFieldProps {
  control: Control<AssetFormData>;
}

export const AssetNameField: React.FC<AssetNameFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="name"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Asset Name *</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter asset name" 
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
