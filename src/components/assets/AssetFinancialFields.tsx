
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SafeDropdownField } from './SafeDropdownField';
import type { AssetFormData } from './types';
import type { DropdownState } from './utils/dropdownHelpers';

interface AssetFinancialFieldsProps {
  control: Control<AssetFormData>;
  departmentsData: DropdownState;
  locationsData: DropdownState;
  serviceContractsData: DropdownState;
}

export const AssetFinancialFields: React.FC<AssetFinancialFieldsProps> = ({ 
  control, 
  departmentsData, 
  locationsData, 
  serviceContractsData 
}) => {
  return (
    <div className="space-y-4">
      <SafeDropdownField
        control={control}
        name="location_id"
        label="Location"
        placeholder="Select location"
        options={locationsData.data}
        isLoading={locationsData.isLoading}
        error={locationsData.error}
      />

      <SafeDropdownField
        control={control}
        name="department_id"
        label="Department"
        placeholder="Select department"
        options={departmentsData.data}
        isLoading={departmentsData.isLoading}
        error={departmentsData.error}
      />

      <FormField
        control={control}
        name="purchase_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purchase Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="purchase_cost"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purchase Cost</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="Enter purchase cost" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="warranty_expiry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Warranty Expiry</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <SafeDropdownField
        control={control}
        name="service_contract_id"
        label="Service Contract"
        placeholder="Select service contract"
        options={serviceContractsData.data}
        isLoading={serviceContractsData.isLoading}
        error={serviceContractsData.error}
      />
    </div>
  );
};
