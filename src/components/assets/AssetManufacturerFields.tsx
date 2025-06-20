
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
import { Input } from '@/components/ui/input';
import { useCompanies } from '@/hooks/useCompanies';
import type { AssetFormData } from './types';

interface AssetManufacturerFieldsProps {
  control: Control<AssetFormData>;
}

export const AssetManufacturerFields: React.FC<AssetManufacturerFieldsProps> = ({
  control,
}) => {
  const { data: manufacturers = [] } = useCompanies('manufacturer');

  return (
    <>
      <FormField
        control={control}
        name="manufacturer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Manufacturer (Text)</FormLabel>
            <FormControl>
              <Input placeholder="Enter manufacturer name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="manufacturer_company_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Manufacturer Company</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value === 'no-manufacturer' ? undefined : value);
              }} 
              value={field.value || 'no-manufacturer'}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select manufacturer company" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="no-manufacturer">No Manufacturer Company</SelectItem>
                {manufacturers.map((manufacturer) => (
                  <SelectItem key={manufacturer.id} value={manufacturer.id}>
                    {manufacturer.company_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
