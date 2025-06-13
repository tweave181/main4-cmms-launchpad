
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FormData {
  name: string;
  description?: string;
  sku: string;
  category?: string;
  quantity_in_stock: number;
  reorder_threshold: number;
  unit_of_measure: 'pieces' | 'kg' | 'lbs' | 'liters' | 'gallons' | 'meters' | 'feet' | 'hours';
  storage_locations?: string;
  linked_asset_type?: string;
}

interface InventoryPartBasicFieldsProps {
  control: Control<FormData>;
}

export const InventoryPartBasicFields: React.FC<InventoryPartBasicFieldsProps> = ({
  control,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Part Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter part name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU *</FormLabel>
              <FormControl>
                <Input placeholder="Enter SKU" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter part description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Input placeholder="Enter category" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="unit_of_measure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit of Measure</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pieces">Pieces</SelectItem>
                  <SelectItem value="kg">Kilograms</SelectItem>
                  <SelectItem value="lbs">Pounds</SelectItem>
                  <SelectItem value="liters">Liters</SelectItem>
                  <SelectItem value="gallons">Gallons</SelectItem>
                  <SelectItem value="meters">Meters</SelectItem>
                  <SelectItem value="feet">Feet</SelectItem>
                  <SelectItem value="hours">Hours</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
