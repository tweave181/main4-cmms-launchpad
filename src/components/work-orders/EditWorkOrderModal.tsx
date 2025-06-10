
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Work Order</DialogTitle>
        </DialogHeader>
        
        <WorkOrderForm
          workOrder={workOrder}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updateWorkOrderMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
