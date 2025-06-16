
import React from 'react';
import { Control } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useDepartments } from '@/hooks/useDepartments';
import { UserFormData } from './userFormSchema';

interface UserDepartmentFieldProps {
  control: Control<UserFormData>;
}

export const UserDepartmentField: React.FC<UserDepartmentFieldProps> = ({ control }) => {
  const { departments } = useDepartments();

  return (
    <FormField
      control={control}
      name="department_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Department</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select department (optional)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">No department</SelectItem>
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
