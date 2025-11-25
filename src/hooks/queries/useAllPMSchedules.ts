
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { PMScheduleWithAssets } from '@/types/preventiveMaintenance';

export const useAllPMSchedules = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['all-pm-schedules'],
    queryFn: async (): Promise<PMScheduleWithAssets[]> => {
      console.log('Fetching ALL PM schedules...');
      
      const { data, error } = await supabase
        .from('preventive_maintenance_schedules')
        .select(`
          *,
          assigned_user:users!assigned_to(id, name, email),
          pm_schedule_assets(
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
        console.error('Error fetching all PM schedules:', error);
        throw error;
      }

      console.log('All PM schedules fetched:', data);
      
      // Transform the data to include assets array
      const transformedData: PMScheduleWithAssets[] = data.map(schedule => ({
        ...schedule,
        frequency_type: schedule.frequency_type as 'daily' | 'weekly' | 'monthly' | 'custom',
        frequency_unit: schedule.frequency_unit as 'days' | 'weeks' | 'months' | undefined,
        assets: schedule.pm_schedule_assets?.map(psa => psa.assets).filter(Boolean) || [],
        assigned_user: schedule.assigned_user ? {
          id: schedule.assigned_user.id,
          name: schedule.assigned_user.name,
          email: schedule.assigned_user.email
        } : undefined,
      }));

      return transformedData;
    },
    enabled: !!userProfile?.tenant_id,
  });
};
