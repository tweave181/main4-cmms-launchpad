import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WorkScheduleForm } from './WorkScheduleForm';
import { useUpdatePMSchedule } from '@/hooks/usePreventiveMaintenance';
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
    checklist_record_id: (schedule as any).checklist_record_id || '',
    is_active: schedule.is_active,
  };

  const handleSubmit = async (data: PMScheduleFormData) => {
    try {
      await updateSchedule.mutateAsync({
        id: schedule.id,
        data,
      });
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
          loading={updateSchedule.isPending}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
};
