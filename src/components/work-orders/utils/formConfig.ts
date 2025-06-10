
import type { WorkOrder, WorkOrderFormData } from '@/types/workOrder';

export const getDefaultFormValues = (workOrder?: WorkOrder): WorkOrderFormData => {
  console.log('Getting default form values for workOrder:', workOrder);
  
  const defaultValues = {
    title: workOrder?.title || '',
    description: workOrder?.description || '',
    asset_id: workOrder?.asset_id || undefined,
    assigned_to: workOrder?.assigned_to || undefined,
    status: workOrder?.status || 'open',
    priority: workOrder?.priority || 'medium',
    work_type: workOrder?.work_type || 'corrective',
    estimated_hours: workOrder?.estimated_hours?.toString() || '',
    estimated_cost: workOrder?.estimated_cost?.toString() || '',
    due_date: workOrder?.due_date || '',
  };
  
  console.log('Default form values:', defaultValues);
  return defaultValues;
};

// Helper function to get safe filter values that won't cause Select errors
export const getSafeFilterValue = (value: string | undefined): string | undefined => {
  const safeValue = value === '' ? undefined : value;
  console.log('getSafeFilterValue input:', value, 'output:', safeValue);
  return safeValue;
};
