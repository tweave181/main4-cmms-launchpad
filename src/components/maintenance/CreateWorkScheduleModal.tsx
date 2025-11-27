import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WorkScheduleForm } from './WorkScheduleForm';
import { useCreatePMSchedule } from '@/hooks/usePreventiveMaintenance';
import type { PMScheduleFormData } from '@/types/preventiveMaintenance';

interface CreateWorkScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateWorkScheduleModal: React.FC<CreateWorkScheduleModalProps> = ({
  open,
  onOpenChange,
}) => {
  const createSchedule = useCreatePMSchedule();

  const handleSubmit = async (data: PMScheduleFormData) => {
    try {
      await createSchedule.mutateAsync(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating work schedule:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Work Schedule Template</DialogTitle>
        </DialogHeader>
        <WorkScheduleForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          loading={createSchedule.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
