
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useDashboardStats = () => {
  const { userProfile } = useAuth();

  const { data: openWorkOrders = 0 } = useQuery({
    queryKey: ['dashboard-open-work-orders'],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const { count, error } = await supabase
        .from('work_orders')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', userProfile.tenant_id)
        .eq('status', 'open');

      if (error) {
        console.error('Error fetching open work orders count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!userProfile?.tenant_id,
  });

  const { data: totalAssets = 0 } = useQuery({
    queryKey: ['dashboard-total-assets'],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const { count, error } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', userProfile.tenant_id);

      if (error) {
        console.error('Error fetching total assets count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!userProfile?.tenant_id,
  });

  const { data: scheduledTasks = 0 } = useQuery({
    queryKey: ['dashboard-scheduled-tasks'],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      // Get count of outstanding PM schedules where next_due_date is in the past or today
      // and last_completed_date is null or before next_due_date
      const { count, error } = await supabase
        .from('preventive_maintenance_schedules')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', userProfile.tenant_id)
        .eq('is_active', true)
        .lte('next_due_date', new Date().toISOString().split('T')[0]); // Due today or overdue

      if (error) {
        console.error('Error fetching scheduled tasks count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!userProfile?.tenant_id,
  });

  return {
    openWorkOrders,
    totalAssets,
    scheduledTasks,
  };
};
