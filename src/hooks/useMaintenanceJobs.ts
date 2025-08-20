import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';
import type { MaintenanceJob, MaintenanceJobFilters, MaintenanceJobFormData } from '@/types/maintenanceJob';

export const useMaintenanceJobs = (filters?: MaintenanceJobFilters) => {
  const { userProfile } = useAuth();
  
  return useQuery({
    queryKey: ['maintenance-jobs', userProfile?.tenant_id, filters],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant ID available');
      }

      let query = supabase
        .from('maintenance_jobs')
        .select(`
          *,
          assigned_user:users!assigned_to(id, name, email),
          asset:assets!asset_id(id, name, asset_tag),
          work_order:work_orders!work_order_id(id, work_order_number),
          pm_schedule:preventive_maintenance_schedules!pm_schedule_id(id, name)
        `)
        .eq('tenant_id', userProfile.tenant_id);

      // Apply filters
      if (filters?.asset_id) {
        query = query.eq('asset_id', filters.asset_id);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.due_date_from) {
        query = query.gte('due_date', filters.due_date_from);
      }
      if (filters?.due_date_to) {
        query = query.lte('due_date', filters.due_date_to);
      }

      // Default ordering
      query = query.order('due_date', { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching maintenance jobs:', error);
        throw error;
      }

      return data as MaintenanceJob[];
    },
    enabled: !!userProfile?.tenant_id,
  });
};

export const useMaintenanceJob = (jobId: string) => {
  return useQuery({
    queryKey: ['maintenance-job', jobId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_jobs')
        .select(`
          *,
          assigned_user:users!assigned_to(id, name, email),
          asset:assets!asset_id(id, name, asset_tag),
          work_order:work_orders!work_order_id(id, work_order_number),
          pm_schedule:preventive_maintenance_schedules!pm_schedule_id(id, name)
        `)
        .eq('id', jobId)
        .single();

      if (error) {
        throw error;
      }

      return data as MaintenanceJob;
    },
    enabled: !!jobId,
  });
};

export const useCreateMaintenanceJob = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async (jobData: MaintenanceJobFormData) => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant ID available');
      }

      const { data, error } = await supabase
        .from('maintenance_jobs')
        .insert({
          ...jobData,
          tenant_id: userProfile.tenant_id,
          created_by: userProfile.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-jobs'] });
      toast({
        title: 'Success',
        description: 'Maintenance job created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create maintenance job',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateMaintenanceJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, updates }: { jobId: string; updates: Partial<MaintenanceJobFormData> }) => {
      const { data, error } = await supabase
        .from('maintenance_jobs')
        .update(updates)
        .eq('id', jobId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-job', data.id] });
      toast({
        title: 'Success',
        description: 'Maintenance job updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update maintenance job',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteMaintenanceJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await supabase
        .from('maintenance_jobs')
        .delete()
        .eq('id', jobId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-jobs'] });
      toast({
        title: 'Success',
        description: 'Maintenance job deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete maintenance job',
        variant: 'destructive',
      });
    },
  });
};