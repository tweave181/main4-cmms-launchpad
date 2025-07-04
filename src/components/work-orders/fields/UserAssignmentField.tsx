import React from 'react';
import { Control } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
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
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { WorkOrderFormData } from '@/types/workOrder';

interface UserAssignmentFieldProps {
  control: Control<WorkOrderFormData>;
}

export const UserAssignmentField: React.FC<UserAssignmentFieldProps> = ({
  control,
}) => {
  const { userProfile } = useAuth();

  const { data: users = [] } = useQuery({
    queryKey: ['users', userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.tenant_id,
  });

  return (
    <FormField
      control={control}
      name="assigned_to"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assigned To</FormLabel>
          <Select 
            onValueChange={(value) => {
              field.onChange(value === 'unassigned' ? undefined : value);
            }} 
            value={field.value || 'unassigned'}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Assign to user" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.email})
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