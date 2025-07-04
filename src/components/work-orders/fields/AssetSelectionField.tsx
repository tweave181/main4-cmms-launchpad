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

interface AssetSelectionFieldProps {
  control: Control<WorkOrderFormData>;
}

export const AssetSelectionField: React.FC<AssetSelectionFieldProps> = ({
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

  return (
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
  );
};