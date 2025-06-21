
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
import type { AssetFormData } from '../types';

interface AssetDepartmentFieldProps {
  control: Control<AssetFormData>;
}

export const AssetDepartmentField: React.FC<AssetDepartmentFieldProps> = ({ control }) => {
  const { departments } = useDepartments();

  return (
    <FormField
      control={control}
      name="department_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Department</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
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
