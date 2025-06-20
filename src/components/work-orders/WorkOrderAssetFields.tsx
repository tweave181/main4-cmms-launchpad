
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
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useCompanies } from '@/hooks/useCompanies';
import type { WorkOrderFormData } from '@/types/workOrder';

interface WorkOrderAssetFieldsProps {
  control: Control<WorkOrderFormData>;
}

export const WorkOrderAssetFields: React.FC<WorkOrderAssetFieldsProps> = ({
  control,
}) => {
  const { userProfile } = useAuth();

  const { data: assets = [] } = useQuery({
    queryKey: ['assets', userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('id, name, asset_tag')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.tenant_id,
  });

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

  const { data: contractors = [] } = useCompanies('contractor');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="asset_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Asset</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value === 'no-asset' ? undefined : value);
                }} 
                value={field.value || 'no-asset'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an asset" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-asset">No Asset</SelectItem>
                  {assets.map((asset) => (
                    <SelectItem key={asset.id} value={asset.id}>
                      {asset.name} {asset.asset_tag && `(${asset.asset_tag})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
      </div>

      <div className="space-y-4">
        <FormField
          control={control}
          name="assigned_to_contractor"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value || false}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Assign to contractor
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="contractor_company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contractor Company</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value === 'no-contractor' ? undefined : value);
                }} 
                value={field.value || 'no-contractor'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contractor company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="no-contractor">No Contractor</SelectItem>
                  {contractors.map((contractor) => (
                    <SelectItem key={contractor.id} value={contractor.id}>
                      {contractor.company_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
