import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

interface UpdateUserPermissionOverridesParams {
  userId: string;
  permissionId: string;
  granted: boolean;
}

export const useUpdateUserPermissionOverrides = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ userId, permissionId, granted }: UpdateUserPermissionOverridesParams) => {
      // Check if override already exists
      const { data: existing } = await supabase
        .from('user_permission_overrides')
        .select('id')
        .eq('user_id', userId)
        .eq('permission_id', permissionId)
        .single();

      if (existing) {
        // Update existing override
        const { error } = await supabase
          .from('user_permission_overrides')
          .update({ granted })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert new override
        const { error } = await supabase
          .from('user_permission_overrides')
          .insert({
            user_id: userId,
            permission_id: permissionId,
            granted,
            tenant_id: userProfile?.tenant_id,
          });

        if (error) throw error;
      }

      return { userId, permissionId, granted };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-permission-overrides'] });
      queryClient.invalidateQueries({ queryKey: ['my-permissions'] });
      toast.success('Permission override updated');
    },
    onError: (error) => {
      console.error('Error updating permission override:', error);
      toast.error('Failed to update permission override');
    },
  });
};
