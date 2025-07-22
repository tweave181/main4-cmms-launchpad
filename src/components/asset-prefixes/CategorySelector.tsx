import React from 'react';
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
import { Control } from 'react-hook-form';
import { useCategories } from '@/hooks/useCategories';
import { Loader2 } from 'lucide-react';

interface CategorySelectorProps {
  control: Control<any>;
  name: string;
  required?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  control,
  name,
  required = false,
}) => {
  const { categories, isLoading } = useCategories();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            Category {required && <span className="text-destructive">*</span>}
          </FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value || ''}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Loading categories...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select a category (optional)" />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">No category</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div>
                    <div className="font-medium">{category.name}</div>
                    {category.description && (
                      <div className="text-sm text-muted-foreground">
                        {category.description}
                      </div>
                    )}
                  </div>
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