
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PMScheduleForm } from './PMScheduleForm';
import { useCreatePMSchedule } from '@/hooks/usePreventiveMaintenance';
import type { PMScheduleFormData } from '@/types/preventiveMaintenance';

interface CreatePMModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreatePMModal: React.FC<CreatePMModalProps> = ({
  open,
  onOpenChange,
}) => {
  const createMutation = useCreatePMSchedule();

  const handleSubmit = (data: PMScheduleFormData) => {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Preventive Maintenance Schedule</DialogTitle>
        </DialogHeader>
        <PMScheduleForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
