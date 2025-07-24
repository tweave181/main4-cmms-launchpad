
import React from 'react';
import {
  FormDialog,
  FormDialogContent,
  FormDialogHeader,
  FormDialogTitle,
} from '@/components/ui/form-dialog';
import { WorkOrderForm } from './WorkOrderForm';
import { useCreateWorkOrder } from '@/hooks/useWorkOrders';
import type { WorkOrderFormData } from '@/types/workOrder';

interface CreateWorkOrderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({
  open,
  onOpenChange,
}) => {
  const createMutation = useCreateWorkOrder();

  const handleSubmit = (data: WorkOrderFormData) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <FormDialog open={open} onOpenChange={() => {}}>
      <FormDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <FormDialogHeader>
          <FormDialogTitle>Create New Work Order</FormDialogTitle>
        </FormDialogHeader>
        <WorkOrderForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={createMutation.isPending}
        />
      </FormDialogContent>
    </FormDialog>
  );
};
