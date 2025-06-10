
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

interface WorkOrderEstimateFieldsProps {
  control: Control<WorkOrderFormData>;
}

export const WorkOrderEstimateFields: React.FC<WorkOrderEstimateFieldsProps> = ({
  control,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="estimated_hours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Hours</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.1"
                placeholder="0.0"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="estimated_cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Cost</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
