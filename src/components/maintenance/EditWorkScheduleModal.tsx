import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WorkScheduleForm } from './WorkScheduleForm';
import { useUpdatePMSchedule } from '@/hooks/usePreventiveMaintenance';
import { usePMScheduleTemplateItems, useAddTemplateItemsToSchedule, useRemoveTemplateItemFromSchedule } from '@/hooks/usePMScheduleTemplateItems';
import type { PMScheduleFormData, PMScheduleWithAssets } from '@/types/preventiveMaintenance';

interface EditWorkScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: PMScheduleWithAssets;
}

export const EditWorkScheduleModal: React.FC<EditWorkScheduleModalProps> = ({
  open,
  onOpenChange,
  schedule,
}) => {
  const updateSchedule = useUpdatePMSchedule();
  const { data: existingTemplateItems = [] } = usePMScheduleTemplateItems(schedule.id);
  const addTemplateItems = useAddTemplateItemsToSchedule();
  const removeTemplateItem = useRemoveTemplateItemFromSchedule();

  const initialData: Partial<PMScheduleFormData> = {
    name: schedule.name,
    description: schedule.description || '',
    instructions: schedule.instructions || '',
    frequency_type: schedule.frequency_type,
    frequency_value: schedule.frequency_value,
    frequency_unit: schedule.frequency_unit,
    next_due_date: schedule.next_due_date,
    asset_ids: schedule.assets?.map(a => a.id) || [],
    assigned_to: schedule.assigned_to || '',
    is_active: schedule.is_active,
  };

  const handleSubmit = async (data: PMScheduleFormData, templateItemIds: string[]) => {
    try {
      // Update the schedule
      await updateSchedule.mutateAsync({
        id: schedule.id,
        data,
      });

      // Handle template items changes
      const existingIds = existingTemplateItems.map(item => item.template_item_id);
      const newIds = templateItemIds.filter(id => !existingIds.includes(id));
      const removedItems = existingTemplateItems.filter(item => !templateItemIds.includes(item.template_item_id));

      // Add new template items
      if (newIds.length > 0) {
        await addTemplateItems.mutateAsync({
          scheduleId: schedule.id,
          templateIds: newIds,
        });
      }

      // Remove deleted template items (except safety-critical ones)
      for (const item of removedItems) {
        if (!item.template?.safety_critical) {
          await removeTemplateItem.mutateAsync({
            scheduleId: schedule.id,
            itemId: item.id,
          });
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating work schedule:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Work Schedule</DialogTitle>
        </DialogHeader>
        <WorkScheduleForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          loading={updateSchedule.isPending || addTemplateItems.isPending || removeTemplateItem.isPending}
          initialData={initialData}
          initialTemplateItems={existingTemplateItems}
        />
      </DialogContent>
    </Dialog>
  );
};
