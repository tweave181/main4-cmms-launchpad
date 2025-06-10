
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { WorkOrderBasicFields } from './WorkOrderBasicFields';
import { WorkOrderSelectFields } from './WorkOrderSelectFields';
import { WorkOrderDateFields } from './WorkOrderDateFields';
import { WorkOrderEstimateFields } from './WorkOrderEstimateFields';
import type { WorkOrder, WorkOrderFormData } from '@/types/workOrder';

const workOrderSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  asset_id: z.string().optional(),
  assigned_to: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  work_type: z.enum(['corrective', 'preventive', 'emergency', 'inspection']),
  estimated_hours: z.string().optional(),
  estimated_cost: z.string().optional(),
  due_date: z.string().optional(),
});

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
    defaultValues: {
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
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <WorkOrderBasicFields control={form.control} />
        <WorkOrderSelectFields control={form.control} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WorkOrderDateFields control={form.control} />
        </div>
        <WorkOrderEstimateFields control={form.control} />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : workOrder ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
