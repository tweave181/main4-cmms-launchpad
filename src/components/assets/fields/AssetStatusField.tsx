
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { AssetFormData } from '../types';

interface AssetStatusFieldProps {
  control: Control<AssetFormData>;
}

export const AssetStatusField: React.FC<AssetStatusFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Status</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="disposed">Disposed</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
