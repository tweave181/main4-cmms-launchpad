
import type { WorkOrder, WorkOrderFormData } from '@/types/workOrder';

export const getDefaultFormValues = (workOrder?: WorkOrder): WorkOrderFormData => {
  return {
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
};
