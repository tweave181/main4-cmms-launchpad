import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import type { TimeRecord, TimeRecordFormData, TimeRecordFilters } from '@/types/timeRecord';

/**
 * Fetch time records with optional filters
 */
export const useTimeRecords = (filters?: TimeRecordFilters) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['time-records', filters],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      let query = supabase
        .from('time_records')
        .select(`
          *,
          user:users!user_id(id, name, email),
          work_order:work_orders(id, work_order_number, title),
          pm_schedule:preventive_maintenance_schedules(id, name),
          maintenance_job:maintenance_jobs(id, name),
          asset:assets(id, name, asset_tag)
        `)
        .eq('tenant_id', userProfile.tenant_id)
        .order('work_date', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.work_order_id) {
        query = query.eq('work_order_id', filters.work_order_id);
      }
      if (filters?.pm_schedule_id) {
        query = query.eq('pm_schedule_id', filters.pm_schedule_id);
      }
      if (filters?.maintenance_job_id) {
        query = query.eq('maintenance_job_id', filters.maintenance_job_id);
      }
      if (filters?.asset_id) {
        query = query.eq('asset_id', filters.asset_id);
      }
      if (filters?.date_from) {
        query = query.gte('work_date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('work_date', filters.date_to);
      }
      if (filters?.work_type) {
        query = query.eq('work_type', filters.work_type);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching time records:', error);
        throw error;
      }

      return data as TimeRecord[];
    },
    enabled: !!userProfile?.tenant_id,
  });
};

/**
 * Create a new time record (supports admin override for user_id)
 */
export const useCreateTimeRecord = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: TimeRecordFormData & { user_id_override?: string }) => {
      if (!userProfile?.tenant_id || !userProfile?.id) {
        throw new Error('User not authenticated');
      }

      // Validate that at least one parent ID is provided
      if (!data.work_order_id && !data.pm_schedule_id && !data.maintenance_job_id) {
        throw new Error('Must specify at least one parent entity (Work Order, PM Schedule, or Maintenance Job)');
      }

      const isAdmin = userProfile.role === 'admin';
      const targetUserId = isAdmin && data.user_id_override 
        ? data.user_id_override 
        : userProfile.id;

      const timeRecordData = {
        ...data,
        tenant_id: userProfile.tenant_id,
        user_id: targetUserId,  // Use admin-selected or current user
        created_by: userProfile.id,  // Always track who created it
        hours_worked: typeof data.hours_worked === 'string' 
          ? parseFloat(data.hours_worked) 
          : data.hours_worked,
        user_id_override: undefined,  // Remove from insert data
      };

      const { data: result, error } = await supabase
        .from('time_records')
        .insert(timeRecordData)
        .select()
        .single();

      if (error) {
        console.error('Error creating time record:', error);
        throw error;
      }

      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['time-records'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      
      const isLoggingForOther = variables.user_id_override && 
                                variables.user_id_override !== userProfile?.id;
      
      toast({
        title: "Success",
        description: isLoggingForOther 
          ? "Time record logged for selected user" 
          : "Time record logged successfully",
      });
    },
    onError: (error: any) => {
      console.error('Create time record error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to log time record",
        variant: "destructive",
      });
    },
  });
};

/**
 * Update an existing time record (supports admin user reassignment)
 */
export const useUpdateTimeRecord = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TimeRecordFormData> & { user_id?: string } }) => {
      const updateData = {
        ...data,
        hours_worked: data.hours_worked 
          ? (typeof data.hours_worked === 'string' ? parseFloat(data.hours_worked) : data.hours_worked)
          : undefined,
      };

      const { data: result, error } = await supabase
        .from('time_records')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating time record:', error);
        throw error;
      }

      return result;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['time-records'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      
      const isReassigned = variables.data.user_id && userProfile?.role === 'admin';
      
      toast({
        title: "Success",
        description: isReassigned 
          ? "Time record reassigned successfully" 
          : "Time record updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Update time record error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update time record",
        variant: "destructive",
      });
    },
  });
};

/**
 * Delete a time record (admin only)
 */
export const useDeleteTimeRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('time_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting time record:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-records'] });
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast({
        title: "Success",
        description: "Time record deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Delete time record error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete time record",
        variant: "destructive",
      });
    },
  });
};

/**
 * Get time summary for a work order (total hours by user)
 */
export const useWorkOrderTimeSummary = (workOrderId?: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['time-summary', 'work-order', workOrderId],
    queryFn: async () => {
      if (!workOrderId || !userProfile?.tenant_id) {
        return [];
      }

      const { data, error } = await supabase
        .from('time_records')
        .select(`
          user_id,
          hours_worked,
          user:users!user_id(id, name, email)
        `)
        .eq('work_order_id', workOrderId)
        .eq('tenant_id', userProfile.tenant_id);

      if (error) {
        console.error('Error fetching time summary:', error);
        throw error;
      }

      // Group by user and sum hours
      const summary = data.reduce((acc, record) => {
        const userId = record.user_id;
        if (!acc[userId]) {
          acc[userId] = {
            user_id: userId,
            user_name: record.user?.name || 'Unknown User',
            total_hours: 0,
            record_count: 0,
          };
        }
        acc[userId].total_hours += record.hours_worked;
        acc[userId].record_count += 1;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(summary);
    },
    enabled: !!workOrderId && !!userProfile?.tenant_id,
  });
};
