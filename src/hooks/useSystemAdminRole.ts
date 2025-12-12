import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useUserSystemAdminStatus = (userId: string) => {
  return useQuery({
    queryKey: ['userSystemAdminStatus', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'system_admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking system admin status:', error);
        return false;
      }

      return !!data;
    },
    enabled: !!userId,
  });
};

export const useAssignSystemAdminRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('assign_system_admin_role', {
        target_user_id: userId,
      });

      if (error) throw error;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['userSystemAdminStatus', userId] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      toast.success('System admin role assigned successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign role: ${error.message}`);
    },
  });
};

export const useRemoveSystemAdminRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('remove_system_admin_role', {
        target_user_id: userId,
      });

      if (error) throw error;
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ['userSystemAdminStatus', userId] });
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      toast.success('System admin role removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove role: ${error.message}`);
    },
  });
};
