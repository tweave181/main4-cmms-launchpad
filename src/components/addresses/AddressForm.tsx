import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { AddressFormData } from '@/types/address';

interface AddressFormProps {
  control: Control<any>;
  prefix?: string;
}

export const AddressForm: React.FC<AddressFormProps> = ({ control, prefix = 'address' }) => {
  const getFieldName = (field: keyof AddressFormData) => 
    prefix ? `${prefix}.${field}` : field;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={getFieldName('address_line_1')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 1 *</FormLabel>
            <FormControl>
              <Input placeholder="Enter address line 1" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={getFieldName('address_line_2')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 2</FormLabel>
            <FormControl>
              <Input placeholder="Enter address line 2 (optional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={getFieldName('address_line_3')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Address Line 3</FormLabel>
            <FormControl>
              <Input placeholder="Enter address line 3 (optional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name={getFieldName('town_or_city')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Town/City</FormLabel>
              <FormControl>
                <Input placeholder="Enter town or city" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name={getFieldName('county_or_state')}
          render={({ field }) => (
            <FormItem>
              <FormLabel>County/State</FormLabel>
              <FormControl>
                <Input placeholder="Enter county or state" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={getFieldName('postcode')}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Postcode</FormLabel>
            <FormControl>
              <Input placeholder="Enter postcode" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};