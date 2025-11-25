import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WorkScheduleForm } from './WorkScheduleForm';
import { useCreatePMSchedule } from '@/hooks/usePreventiveMaintenance';
import { useAddTemplateItemsToSchedule } from '@/hooks/usePMScheduleTemplateItems';
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
  const addTemplateItems = useAddTemplateItemsToSchedule();

  const handleSubmit = async (data: PMScheduleFormData, templateItemIds: string[]) => {
    try {
      // Create the schedule first
      const newSchedule = await createSchedule.mutateAsync(data);
      
      // Then link the template items
      if (newSchedule?.id && templateItemIds.length > 0) {
        await addTemplateItems.mutateAsync({
          scheduleId: newSchedule.id,
          templateIds: templateItemIds,
        });
      }
      
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
          loading={createSchedule.isPending || addTemplateItems.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
