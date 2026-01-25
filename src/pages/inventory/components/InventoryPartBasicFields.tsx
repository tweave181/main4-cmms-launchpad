import React from 'react';
import { Control, useWatch } from 'react-hook-form';
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
import { Loader2 } from 'lucide-react';
import type { FormData } from './useInventoryPartForm';

interface CategoryWithSKU {
  id: string;
  name: string;
  sku_code: string | null;
}

interface InventoryPartBasicFieldsProps {
  control: Control<FormData>;
  categories?: CategoryWithSKU[];
  categoriesLoading?: boolean;
  generatedSKU?: string;
  isGeneratingSKU?: boolean;
  onCategoryChange?: (categoryId: string | null) => void;
  isEditing?: boolean;
}

export const InventoryPartBasicFields: React.FC<InventoryPartBasicFieldsProps> = ({
  control,
  categories = [],
  categoriesLoading = false,
  generatedSKU = '',
  isGeneratingSKU = false,
  onCategoryChange,
  isEditing = false,
}) => {
  // Watch the SKU value for editing mode
  const currentSku = useWatch({ control, name: 'sku' });
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
              <Input 
                placeholder="Enter part name" 
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
          name="spare_parts_category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  onCategoryChange?.(value);
                }}
                value={field.value || ''}
                disabled={categoriesLoading || isEditing}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Select category'} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categoriesLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2">Loading categories...</span>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} {category.sku_code && `(${category.sku_code})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormItem>
          <FormLabel>SKU (Auto-generated)</FormLabel>
          <FormControl>
            <div className="relative">
              <Input 
                value={isEditing ? (currentSku || '') : (generatedSKU || 'Select a category...')} 
                readOnly 
                disabled
                className="bg-muted"
              />
              {isGeneratingSKU && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </FormControl>
        </FormItem>

        <FormField
          control={control}
          name="inventory_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inventory Type *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select inventory type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="spare_parts">Spare Parts</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="supplies">Supplies</SelectItem>
                  <SelectItem value="materials">Materials</SelectItem>
                </SelectContent>
              </Select>
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
              <Textarea 
                placeholder="Enter part description" 
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        <FormField
          control={control}
          name="unit_cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Cost</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00" 
                  autoComplete="off"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};
