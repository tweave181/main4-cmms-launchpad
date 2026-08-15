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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEquipmentCategories } from '@/hooks/useEquipmentCategories';
import type { AssetFormData } from '../types';

interface AssetEquipmentCategoryFieldProps {
  control: Control<AssetFormData>;
  onCategoryChange: (categoryId: string, categoryName: string) => void;
}

export const AssetEquipmentCategoryField: React.FC<AssetEquipmentCategoryFieldProps> = ({
  control,
  onCategoryChange,
}) => {
  const { categories, activeCategories, isLoading } = useEquipmentCategories();
  const hasCategories = categories.length > 0;

  return (
    <FormField
      control={control}
      name="equipment_category_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Equipment Category</FormLabel>

          {!isLoading && !hasCategories && (
            <Alert className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                No equipment categories exist yet. An administrator must create one before
                asset tags can be generated automatically.
              </AlertDescription>
            </Alert>
          )}

          <Select
            onValueChange={(value) => {
              if (value === '__no_value__') {
                field.onChange('');
                onCategoryChange('', '');
                return;
              }
              const selected = activeCategories.find((c) => c.id === value);
              field.onChange(value);
              onCategoryChange(value, selected?.category_name || '');
            }}
            value={field.value || '__no_value__'}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select equipment category" />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="__no_value__">Select...</SelectItem>
              {activeCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.display_prefix} — {category.category_name}
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
