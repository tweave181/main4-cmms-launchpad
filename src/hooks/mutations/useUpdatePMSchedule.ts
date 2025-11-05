
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast, logError } from '@/utils/errorHandling';
import type { PMScheduleFormData } from '@/types/preventiveMaintenance';

export const useUpdatePMSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<PMScheduleFormData> }) => {
      console.log('Updating PM schedule:', id, data);

      const { error } = await supabase
        .from('preventive_maintenance_schedules')
        .update({
          name: data.name,
          description: data.description,
          instructions: data.instructions,
          frequency_type: data.frequency_type,
          frequency_value: data.frequency_value,
          frequency_unit: data.frequency_unit,
          next_due_date: data.next_due_date,
          assigned_to: data.assigned_to,
          is_active: data.is_active,
        })
        .eq('id', id);

      if (error) throw error;

      // Update asset links if provided
      if (data.asset_ids) {
        // Remove existing links
        await supabase
          .from('pm_schedule_assets')
          .delete()
          .eq('pm_schedule_id', id);

        // Add new links
        if (data.asset_ids.length > 0) {
          const assetLinks = data.asset_ids.map(assetId => ({
            pm_schedule_id: id,
            asset_id: assetId,
          }));

          const { error: linkError } = await supabase
            .from('pm_schedule_assets')
            .insert(assetLinks);

          if (linkError) throw linkError;
        }
      }

      // Update checklist items if provided
      if (data.checklist_items) {
        // Remove existing checklist items
        await supabase
          .from('pm_schedule_checklist_items')
          .delete()
          .eq('pm_schedule_id', id);

        // Add new checklist items
        if (data.checklist_items.length > 0) {
          const checklistItems = data.checklist_items.map(item => ({
            pm_schedule_id: id,
            item_text: item.item_text,
            item_type: item.item_type,
            sort_order: item.sort_order,
          }));

          const { error: checklistError } = await supabase
            .from('pm_schedule_checklist_items')
            .insert(checklistItems);

          if (checklistError) throw checklistError;
        }
      }

      console.log('PM schedule updated successfully');
    },
    onSuccess: () => {
      showSuccessToast("Preventive maintenance schedule updated successfully");
      queryClient.invalidateQueries({ queryKey: ['pm-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['pm-schedules-calendar'] });
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Update Failed', context: 'PM Schedule' });
    },
  });
};
