
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
import { useCategories } from '@/hooks/useCategories';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AssetFormData } from '../types';

interface AssetCategoryFieldProps {
  control: Control<AssetFormData>;
  onCategoryChange: (value: string) => void;
}

export const AssetCategoryField: React.FC<AssetCategoryFieldProps> = ({ 
  control, 
  onCategoryChange 
}) => {
  const { categories, isLoading, error } = useCategories();

  if (error) {
    console.warn('Failed to load categories:', error);
  }

  return (
    <FormField
      control={control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          
          {error && (
            <Alert variant="destructive" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Failed to load categories. Select option may be limited.
              </AlertDescription>
            </Alert>
          )}
          
          <Select 
            onValueChange={(value) => {
              const selectedCategory = categories.find(cat => cat.id === value);
              const categoryName = selectedCategory?.name || value;
              field.onChange(categoryName);
              onCategoryChange(categoryName);
            }}
            value={categories.find(cat => cat.name === field.value)?.id || ''}
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
                  <SelectValue placeholder="Select category" />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">Select...</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
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
