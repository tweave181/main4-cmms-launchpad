
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
              <Input 
                placeholder="Enter locations (comma separated)" 
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

      <FormField
        control={control}
        name="linked_asset_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Linked Asset Type</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter asset type" 
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
    </>
  );
};
