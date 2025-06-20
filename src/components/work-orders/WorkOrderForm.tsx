
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { WorkOrderBasicFields } from './WorkOrderBasicFields';
import { WorkOrderAssetFields } from './WorkOrderAssetFields';
import { WorkOrderSelectFields } from './WorkOrderSelectFields';
import { WorkOrderDateFields } from './WorkOrderDateFields';
import { WorkOrderEstimateFields } from './WorkOrderEstimateFields';
import { WorkOrderFormActions } from './WorkOrderFormActions';
import { workOrderSchema } from './utils/validation';
import { getDefaultFormValues } from './utils/formConfig';
import type { WorkOrder, WorkOrderFormData } from '@/types/workOrder';

interface WorkOrderFormProps {
  workOrder?: WorkOrder;
  onSubmit: (data: WorkOrderFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({
  workOrder,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const form = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema),
    defaultValues: getDefaultFormValues(workOrder),
  });

  // Watch for changes to assigned_to_contractor and clear contractor_company_id when unchecked
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'assigned_to_contractor' && !value.assigned_to_contractor) {
        form.setValue('contractor_company_id', undefined);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <WorkOrderBasicFields control={form.control} />
        <WorkOrderAssetFields control={form.control} />
        <WorkOrderSelectFields control={form.control} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WorkOrderDateFields control={form.control} />
        </div>
        <WorkOrderEstimateFields control={form.control} />
        
        <WorkOrderFormActions
          onCancel={onCancel}
          loading={loading}
          isEditing={!!workOrder}
        />
      </form>
    </Form>
  );
};
