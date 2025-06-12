
import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PMScheduleForm } from './PMScheduleForm';
import { useUpdatePMSchedule, usePMSchedule } from '@/hooks/usePreventiveMaintenance';
import { Skeleton } from '@/components/ui/skeleton';
import type { PMScheduleFormData } from '@/types/preventiveMaintenance';

interface EditPMModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleId: string;
}

export const EditPMModal: React.FC<EditPMModalProps> = ({
  open,
  onOpenChange,
  scheduleId,
}) => {
  const { data: schedule, isLoading } = usePMSchedule(scheduleId);
  const updateMutation = useUpdatePMSchedule();

  const handleSubmit = (data: PMScheduleFormData) => {
    updateMutation.mutate({ id: scheduleId, data }, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Preventive Maintenance Schedule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!schedule) {
    return null;
  }

  const initialData: PMScheduleFormData = {
    name: schedule.name,
    description: schedule.description,
    instructions: schedule.instructions,
    frequency_type: schedule.frequency_type,
    frequency_value: schedule.frequency_value,
    frequency_unit: schedule.frequency_unit,
    next_due_date: schedule.next_due_date,
    asset_ids: schedule.assets?.map(asset => asset.id) || [],
    assigned_to: schedule.assigned_to,
    is_active: schedule.is_active,
    checklist_items: schedule.checklist_items?.map(item => ({
      item_text: item.item_text,
      item_type: item.item_type,
      sort_order: item.sort_order,
    })) || [],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Preventive Maintenance Schedule</DialogTitle>
        </DialogHeader>
        <PMScheduleForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={updateMutation.isPending}
          initialData={initialData}
        />
      </DialogContent>
    </Dialog>
  );
};
