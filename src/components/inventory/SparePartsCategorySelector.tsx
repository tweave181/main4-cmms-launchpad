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
import { useSparePartsCategories } from '@/hooks/useSparePartsCategories';
import { Loader2 } from 'lucide-react';

interface SparePartsCategorySelectorProps {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export const SparePartsCategorySelector: React.FC<SparePartsCategorySelectorProps> = ({
  control,
  name,
  label = 'Category',
  placeholder = 'Select category',
  required = false,
}) => {
  const { activeCategories, isLoading } = useSparePartsCategories();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <Select
            onValueChange={(value) => field.onChange(value === 'none' ? null : value)}
            value={field.value || ''}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? 'Loading categories...' : placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2">Loading categories...</span>
                </div>
              ) : (
                <>
                  <SelectItem value="none">No category</SelectItem>
                  {activeCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};