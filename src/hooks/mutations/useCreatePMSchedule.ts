
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import type { PMScheduleFormData } from '@/types/preventiveMaintenance';

export const useCreatePMSchedule = () => {
  const { userProfile } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PMScheduleFormData) => {
      console.log('Creating PM schedule with data:', data);

      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      // Create the PM schedule
      const { data: schedule, error: scheduleError } = await supabase
        .from('preventive_maintenance_schedules')
        .insert({
          tenant_id: userProfile.tenant_id,
          name: data.name,
          description: data.description,
          instructions: data.instructions,
          frequency_type: data.frequency_type,
          frequency_value: data.frequency_value,
          frequency_unit: data.frequency_unit,
          next_due_date: data.next_due_date,
          assigned_to: data.assigned_to,
          is_active: data.is_active,
          created_by: userProfile.id,
        })
        .select()
        .single();

      if (scheduleError) {
        console.error('Error creating PM schedule:', scheduleError);
        throw scheduleError;
      }

      console.log('PM schedule created:', schedule);

      // Link assets to the schedule
      if (data.asset_ids.length > 0) {
        const assetLinks = data.asset_ids.map(assetId => ({
          pm_schedule_id: schedule.id,
          asset_id: assetId,
        }));

        const { error: linkError } = await supabase
          .from('pm_schedule_assets')
          .insert(assetLinks);

        if (linkError) {
          console.error('Error linking assets to PM schedule:', linkError);
          throw linkError;
        }

        console.log('Assets linked to PM schedule successfully');
      }

      // Create checklist items
      if (data.checklist_items.length > 0) {
        const checklistItems = data.checklist_items.map(item => ({
          pm_schedule_id: schedule.id,
          item_text: item.item_text,
          item_type: item.item_type,
          sort_order: item.sort_order,
        }));

        const { error: checklistError } = await supabase
          .from('pm_schedule_checklist_items')
          .insert(checklistItems);

        if (checklistError) {
          console.error('Error creating checklist items:', checklistError);
          throw checklistError;
        }

        console.log('Checklist items created successfully');
      }

      return schedule;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Preventive maintenance schedule created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['pm-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['pm-schedules-calendar'] });
    },
    onError: (error: any) => {
      console.error('PM schedule creation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create PM schedule",
        variant: "destructive",
      });
    },
  });
};
