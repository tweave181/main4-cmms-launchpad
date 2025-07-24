
import React from 'react';
import {
  FormDialog,
  FormDialogContent,
  FormDialogHeader,
  FormDialogTitle,
} from '@/components/ui/form-dialog';
import { WorkOrderForm } from './WorkOrderForm';
import { useUpdateWorkOrder } from '@/hooks/useWorkOrders';
import type { WorkOrder, WorkOrderFormData } from '@/types/workOrder';

interface EditWorkOrderModalProps {
  workOrder: WorkOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}

export const EditWorkOrderModal: React.FC<EditWorkOrderModalProps> = ({
  workOrder,
  open,
  onOpenChange,
  onClose,
}) => {
  const updateWorkOrderMutation = useUpdateWorkOrder();

  const handleSubmit = async (data: WorkOrderFormData) => {
    try {
      await updateWorkOrderMutation.mutateAsync({
        id: workOrder.id,
        data,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update work order:', error);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <FormDialog open={open} onOpenChange={() => {}}>
      <FormDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <FormDialogHeader>
          <FormDialogTitle>Edit Work Order</FormDialogTitle>
        </FormDialogHeader>
        
        <WorkOrderForm
          workOrder={workOrder}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updateWorkOrderMutation.isPending}
        />
      </FormDialogContent>
    </FormDialog>
  );
};
