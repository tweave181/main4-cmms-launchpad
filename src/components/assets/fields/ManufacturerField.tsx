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
import { useManufacturerAddresses } from '@/hooks/useManufacturerAddresses';
import type { AssetFormData } from '../types';

interface ManufacturerFieldProps {
  control: Control<AssetFormData>;
}

export const ManufacturerField: React.FC<ManufacturerFieldProps> = ({
  control,
}) => {
  const { data: manufacturers = [], isLoading } = useManufacturerAddresses();

  return (
    <FormField
      control={control}
      name="manufacturer_company_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Manufacturer</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value === 'no-manufacturer' ? undefined : value);
            }} 
            value={field.value || 'no-manufacturer'}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading..." : "Select manufacturer"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="no-manufacturer">No Manufacturer</SelectItem>
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
  );
};