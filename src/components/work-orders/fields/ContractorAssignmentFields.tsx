import React from 'react';
import { Control, useWatch } from 'react-hook-form';
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
import { useCompanies } from '@/hooks/useCompanies';
import type { WorkOrderFormData } from '@/types/workOrder';

interface ContractorAssignmentFieldsProps {
  control: Control<WorkOrderFormData>;
}

export const ContractorAssignmentFields: React.FC<ContractorAssignmentFieldsProps> = ({
  control,
}) => {
  // Watch the assigned_to_contractor field to conditionally show contractor company
  const assignedToContractor = useWatch({
    control,
    name: 'assigned_to_contractor',
  });

  const { data: contractors = [] } = useCompanies('contractor');

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="assigned_to_contractor"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={field.value || false}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                }}
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

      {assignedToContractor && (
        <FormField
          control={control}
          name="contractor_company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contractor Company *</FormLabel>
              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                }} 
                value={field.value || ''}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select contractor company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
      )}
    </div>
  );
};