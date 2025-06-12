
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Database } from '@/integrations/supabase/types';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().optional(),
  quantity_in_stock: z.number().min(0, "Quantity must be non-negative"),
  reorder_threshold: z.number().min(0, "Reorder threshold must be non-negative"),
  unit_of_measure: z.enum(['pieces', 'kg', 'lbs', 'liters', 'gallons', 'meters', 'feet', 'hours']),
  storage_locations: z.string().optional(),
  linked_asset_type: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;
type InventoryPartData = Omit<Database['public']['Tables']['inventory_parts']['Insert'], 'tenant_id' | 'created_by'>;

interface InventoryPartFormProps {
  initialData?: Partial<InventoryPartData>;
  onSubmit: (data: InventoryPartData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const InventoryPartForm: React.FC<InventoryPartFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      sku: initialData?.sku || '',
      category: initialData?.category || '',
      quantity_in_stock: initialData?.quantity_in_stock || 0,
      reorder_threshold: initialData?.reorder_threshold || 0,
      unit_of_measure: initialData?.unit_of_measure || 'pieces',
      storage_locations: initialData?.storage_locations?.join(', ') || '',
      linked_asset_type: initialData?.linked_asset_type || '',
    },
  });

  const handleSubmit = (data: FormData) => {
    const submitData: InventoryPartData = {
      ...data,
      storage_locations: data.storage_locations 
        ? data.storage_locations.split(',').map(loc => loc.trim()).filter(Boolean)
        : [],
    };
    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
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
            control={form.control}
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
          control={form.control}
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
            control={form.control}
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
            control={form.control}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quantity_in_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity in Stock</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reorder_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reorder Threshold</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field} 
                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="storage_locations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Storage Locations</FormLabel>
              <FormControl>
                <Input placeholder="Enter locations (comma separated)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="linked_asset_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Linked Asset Type</FormLabel>
              <FormControl>
                <Input placeholder="Enter asset type" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Part' : 'Create Part'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
