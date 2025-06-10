
import React from 'react';
import { Control } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { WorkOrderFormData } from '@/types/workOrder';

interface WorkOrderDateFieldsProps {
  control: Control<WorkOrderFormData>;
}

export const WorkOrderDateFields: React.FC<WorkOrderDateFieldsProps> = ({
  control,
}) => {
  return (
    <FormField
      control={control}
      name="due_date"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Due Date</FormLabel>
          <FormControl>
            <Input type="date" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
