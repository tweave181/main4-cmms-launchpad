
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

  const { data: overdueScheduledTasks = 0 } = useQuery({
    queryKey: ['dashboard-overdue-scheduled-tasks'],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('preventive_maintenance_schedules')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', userProfile.tenant_id)
        .eq('is_active', true)
        .lt('next_due_date', today); // Overdue (before today)

      if (error) {
        console.error('Error fetching overdue scheduled tasks count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!userProfile?.tenant_id,
  });

  const { data: dueTodayScheduledTasks = 0 } = useQuery({
    queryKey: ['dashboard-due-today-scheduled-tasks'],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from('preventive_maintenance_schedules')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', userProfile.tenant_id)
        .eq('is_active', true)
        .eq('next_due_date', today); // Due today

      if (error) {
        console.error('Error fetching due today scheduled tasks count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!userProfile?.tenant_id,
  });

  return {
    openWorkOrders,
    overdueScheduledTasks,
    dueTodayScheduledTasks,
  };
};
