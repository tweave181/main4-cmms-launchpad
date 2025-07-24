
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
import { useDepartments } from '@/hooks/useDepartments';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { AssetFormData } from '../types';

interface AssetDepartmentFieldProps {
  control: Control<AssetFormData>;
}

export const AssetDepartmentField: React.FC<AssetDepartmentFieldProps> = ({ control }) => {
  const { departments, isLoading } = useDepartments();

  // Log warning if departments failed to load
  if (!isLoading && departments.length === 0) {
    console.warn('Failed to load departments or no departments available');
  }

  return (
    <FormField
      control={control}
      name="department_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Department</FormLabel>
          
          {!isLoading && departments.length === 0 && (
            <Alert variant="destructive" className="mb-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Failed to load departments. Please refresh the page.
              </AlertDescription>
            </Alert>
          )}
          
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
                    <span>Loading...</span>
                  </div>
                ) : (
                  <SelectValue placeholder="Select department" />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">Select...</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
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
