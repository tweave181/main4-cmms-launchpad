
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
import { AssetPrefixFormData } from './useAssetPrefixForm';

interface AssetPrefixBasicFieldsProps {
  control: Control<AssetPrefixFormData>;
}

export const AssetPrefixBasicFields: React.FC<AssetPrefixBasicFieldsProps> = ({
  control,
}) => {
  return (
    <>
      <FormField
        control={control}
        name="prefix_letter"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Prefix Letter</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="E"
                maxLength={1}
                style={{ textTransform: 'uppercase' }}
                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="number_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number Code</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="001"
                maxLength={3}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  field.onChange(value.padStart(3, '0').slice(0, 3));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Chillers"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800 font-medium">Preview:</p>
        <p className="text-lg font-mono font-bold text-blue-900 mt-1">
          {control._formValues.prefix_letter || 'X'}
          {parseInt(control._formValues.number_code || '0') || '0'}/001
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Example asset tag format
        </p>
      </div>
    </>
  );
};
