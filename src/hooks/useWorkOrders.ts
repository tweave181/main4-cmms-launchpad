
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import type { WorkOrder, WorkOrderFormData, WorkOrderFilters } from '@/types/workOrder';

export const useWorkOrders = (filters?: WorkOrderFilters) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['work-orders', filters],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      let query = supabase
        .from('work_orders')
        .select(`
          *,
          asset:assets(name),
          assigned_user:users!assigned_to(name),
          created_user:users!created_by(name)
        `)
        .eq('tenant_id', userProfile.tenant_id)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.work_type) {
        query = query.eq('work_type', filters.work_type);
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching work orders:', error);
        throw error;
      }

      return data as WorkOrder[];
    },
    enabled: !!userProfile?.tenant_id,
  });
};

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: WorkOrderFormData) => {
      if (!userProfile?.tenant_id || !userProfile?.id) {
        throw new Error('User not authenticated');
      }

      const workOrderData = {
        ...data,
        tenant_id: userProfile.tenant_id,
        created_by: userProfile.id,
        estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
        estimated_cost: data.estimated_cost ? parseFloat(data.estimated_cost) : null,
      };

      const { data: result, error } = await supabase
        .from('work_orders')
        .insert(workOrderData)
        .select()
        .single();

      if (error) {
        console.error('Error creating work order:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast({
        title: "Success",
        description: "Work order created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Create work order error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create work order",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateWorkOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<WorkOrderFormData> }) => {
      const updateData = {
        ...data,
        estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
        estimated_cost: data.estimated_cost ? parseFloat(data.estimated_cost) : null,
      };

      const { data: result, error } = await supabase
        .from('work_orders')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating work order:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      toast({
        title: "Success",
        description: "Work order updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Update work order error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update work order",
        variant: "destructive",
      });
    },
  });
};
