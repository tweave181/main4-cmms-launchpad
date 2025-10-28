import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock } from 'lucide-react';
import type { Control } from 'react-hook-form';
import type { UserFormData } from './userFormSchema';

interface UserTimeTrackingFieldProps {
  control: Control<UserFormData>;
}

export const UserTimeTrackingField: React.FC<UserTimeTrackingFieldProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="available_for_time_tracking"
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Available for Time Tracking
            </FormLabel>
            <FormDescription>
              When enabled, this user will appear in the user selection dropdown when logging time records. 
              Disable for users who don't need to log time (e.g., administrative staff).
            </FormDescription>
          </div>
        </FormItem>
      )}
    />
  );
};
