
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { PreventiveMaintenanceSchedule, PMScheduleFormData, PMScheduleWithAssets } from '@/types/preventiveMaintenance';
import { useAuth } from '@/contexts/auth';

export const usePMSchedules = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['pm-schedules'],
    queryFn: async (): Promise<PMScheduleWithAssets[]> => {
      console.log('Fetching PM schedules...');
      
      const { data, error } = await supabase
        .from('preventive_maintenance_schedules')
        .select(`
          *,
          pm_schedule_assets (
            asset_id,
            assets (
              id,
              name,
              asset_tag
            )
          )
        `)
        .eq('tenant_id', userProfile?.tenant_id)
        .order('next_due_date', { ascending: true });

      if (error) {
        console.error('Error fetching PM schedules:', error);
        throw error;
      }

      console.log('PM schedules fetched:', data);

      return data.map(schedule => ({
        ...schedule,
        assets: schedule.pm_schedule_assets?.map(psa => psa.assets).filter(Boolean) || []
      }));
    },
    enabled: !!userProfile?.tenant_id,
  });
};

export const useCreatePMSchedule = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: PMScheduleFormData) => {
      console.log('Creating PM schedule:', data);

      if (!userProfile) {
        throw new Error('User profile not found');
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
          is_active: data.is_active,
          created_by: userProfile.id,
        })
        .select()
        .single();

      if (scheduleError) {
        console.error('Error creating PM schedule:', scheduleError);
        throw scheduleError;
      }

      // Link assets to the PM schedule
      if (data.asset_ids.length > 0) {
        const assetLinks = data.asset_ids.map(asset_id => ({
          pm_schedule_id: schedule.id,
          asset_id,
        }));

        const { error: linkError } = await supabase
          .from('pm_schedule_assets')
          .insert(assetLinks);

        if (linkError) {
          console.error('Error linking assets to PM schedule:', linkError);
          throw linkError;
        }
      }

      toast({
        title: "Success",
        description: "Preventive maintenance schedule created successfully",
      });

      return schedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-schedules'] });
    },
    onError: (error) => {
      console.error('PM schedule creation failed:', error);
      toast({
        title: "Error",
        description: "Failed to create preventive maintenance schedule",
        variant: "destructive",
      });
    },
  });
};

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
          is_active: data.is_active,
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating PM schedule:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Preventive maintenance schedule updated successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-schedules'] });
    },
    onError: (error) => {
      console.error('PM schedule update failed:', error);
      toast({
        title: "Error",
        description: "Failed to update preventive maintenance schedule",
        variant: "destructive",
      });
    },
  });
};

export const useDeletePMSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting PM schedule:', id);

      const { error } = await supabase
        .from('preventive_maintenance_schedules')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting PM schedule:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Preventive maintenance schedule deleted successfully",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pm-schedules'] });
    },
    onError: (error) => {
      console.error('PM schedule deletion failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete preventive maintenance schedule",
        variant: "destructive",
      });
    },
  });
};
