
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import type { PMScheduleFormData, PMScheduleWithAssets } from '@/types/preventiveMaintenance';

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
          pm_schedule_assets!inner(
            asset_id,
            assets(
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
      
      // Transform the data to include assets array
      const transformedData = data.map(schedule => ({
        ...schedule,
        assets: schedule.pm_schedule_assets?.map(psa => psa.assets).filter(Boolean) || []
      }));

      return transformedData;
    },
    enabled: !!userProfile?.tenant_id,
  });
};

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

      return schedule;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Preventive maintenance schedule created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['pm-schedules'] });
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

          if (linkError) {
            console.error('Error updating asset links:', linkError);
            throw linkError;
          }
        }
      }

      console.log('PM schedule updated successfully');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Preventive maintenance schedule updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['pm-schedules'] });
    },
    onError: (error: any) => {
      console.error('PM schedule update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update PM schedule",
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

      console.log('PM schedule deleted successfully');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Preventive maintenance schedule deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['pm-schedules'] });
    },
    onError: (error: any) => {
      console.error('PM schedule deletion error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete PM schedule",
        variant: "destructive",
      });
    },
  });
};
