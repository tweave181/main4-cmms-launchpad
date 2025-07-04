
import React from 'react';
import { Control } from 'react-hook-form';
import { AssetSelectionField } from './fields/AssetSelectionField';
import { UserAssignmentField } from './fields/UserAssignmentField';
import { ContractorAssignmentFields } from './fields/ContractorAssignmentFields';
import type { WorkOrderFormData } from '@/types/workOrder';

interface WorkOrderAssetFieldsProps {
  control: Control<WorkOrderFormData>;
}

export const WorkOrderAssetFields: React.FC<WorkOrderAssetFieldsProps> = ({
  control,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AssetSelectionField control={control} />
        <UserAssignmentField control={control} />
      </div>
      
      <ContractorAssignmentFields control={control} />
    </div>
  );
};
