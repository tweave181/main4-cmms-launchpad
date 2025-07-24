
import React from 'react';
import {
  FormDialog,
  FormDialogContent,
  FormDialogHeader,
  FormDialogTitle,
} from '@/components/ui/form-dialog';
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
    <FormDialog open={open} onOpenChange={() => {}}>
      <FormDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <FormDialogHeader>
          <FormDialogTitle>Create Preventive Maintenance Schedule</FormDialogTitle>
        </FormDialogHeader>
        <PMScheduleForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={createMutation.isPending}
        />
      </FormDialogContent>
    </FormDialog>
  );
};
