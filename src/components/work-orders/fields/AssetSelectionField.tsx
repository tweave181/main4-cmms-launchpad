import React, { useState } from 'react';
import { Control } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { AssetSelectionModal } from './AssetSelectionModal';
import type { WorkOrderFormData } from '@/types/workOrder';

interface AssetSelectionFieldProps {
  control: Control<WorkOrderFormData>;
}

export const AssetSelectionField: React.FC<AssetSelectionFieldProps> = ({
  control,
}) => {
  const { userProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get selected asset details for display
  const { data: selectedAsset } = useQuery({
    queryKey: ['selected-asset-details', userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assets')
        .select('id, name, asset_tag')
        .eq('status', 'active');

      if (error) throw error;
      return data;
    },
    enabled: !!userProfile?.tenant_id,
  });

  return (
    <FormField
      control={control}
      name="asset_id"
      render={({ field }) => {
        const currentAsset = selectedAsset?.find(asset => asset.id === field.value);
        const displayValue = currentAsset 
          ? `${currentAsset.name}${currentAsset.asset_tag ? ` (${currentAsset.asset_tag})` : ''}`
          : '';

        return (
          <FormItem>
            <FormLabel>Asset</FormLabel>
            <div className="flex space-x-2">
              <FormControl>
                <Input
                  placeholder={field.value ? displayValue : "No asset selected"}
                  value={displayValue}
                  readOnly
                  className="flex-1"
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(true)}
              >
                Select Asset
              </Button>
            </div>
            <FormMessage />

            <AssetSelectionModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSelect={(asset) => {
                field.onChange(asset.id);
              }}
            />
          </FormItem>
        );
      }}
    />
  );
};