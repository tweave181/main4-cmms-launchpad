
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import type { PMScheduleWithAssets, PMScheduleChecklistItem } from '@/types/preventiveMaintenance';

export const usePMSchedule = (id: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['pm-schedule', id],
    queryFn: async (): Promise<PMScheduleWithAssets> => {
      console.log('Fetching PM schedule:', id);
      
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
        .eq('id', id)
        .eq('tenant_id', userProfile?.tenant_id)
        .single();

      if (error) {
        console.error('Error fetching PM schedule:', error);
        throw error;
      }

      console.log('PM schedule fetched:', data);
      
      // Fetch checklist items separately
      const { data: checklistItems, error: checklistError } = await supabase
        .from('pm_schedule_checklist_items')
        .select('*')
        .eq('pm_schedule_id', id)
        .order('sort_order');

      if (checklistError) {
        console.error('Error fetching checklist items:', checklistError);
        throw checklistError;
      }

      // Transform the data with proper type casting for checklist items
      const transformedData: PMScheduleWithAssets = {
        ...data,
        frequency_type: data.frequency_type as 'daily' | 'weekly' | 'monthly' | 'custom',
        frequency_unit: data.frequency_unit as 'days' | 'weeks' | 'months' | undefined,
        assets: data.pm_schedule_assets?.map(psa => psa.assets).filter(Boolean) || [],
        assigned_user: data.assigned_user ? {
          id: data.assigned_user.id,
          name: data.assigned_user.name,
          email: data.assigned_user.email
        } : undefined,
        checklist_items: checklistItems?.map(item => ({
          id: item.id,
          pm_schedule_id: item.pm_schedule_id,
          item_text: item.item_text,
          item_type: item.item_type as 'checkbox' | 'value',
          sort_order: item.sort_order,
          created_at: item.created_at,
          updated_at: item.updated_at
        } as PMScheduleChecklistItem)) || []
      };

      return transformedData;
    },
    enabled: !!userProfile?.tenant_id && !!id,
  });
};
