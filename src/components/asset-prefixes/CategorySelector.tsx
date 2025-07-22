
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
import { Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

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
            onValueChange={(value) => {
              // Convert empty selection to null for optional fields
              field.onChange(value || null);
            }} 
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
              {categories.length === 0 ? (
                <div className="p-2 text-center text-muted-foreground">
                  <p className="text-sm mb-2">No categories available</p>
                  <Link 
                    to="/categories" 
                    className="inline-flex items-center space-x-1 text-xs text-primary hover:underline"
                  >
                    <span>Manage categories</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              ) : (
                categories.map((category) => (
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
                ))
              )}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
