import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];

interface UpdateRolePermissionsParams {
  role: AppRole;
  permissionIds: string[];
}

export const useUpdateRolePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ role, permissionIds }: UpdateRolePermissionsParams) => {
      // Delete existing permissions for this role
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', role);

      if (deleteError) throw deleteError;

      // Insert new permissions
      if (permissionIds.length > 0) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert(
            permissionIds.map(permissionId => ({
              role,
              permission_id: permissionId,
            }))
          );

        if (insertError) throw insertError;
      }

      return { role, permissionIds };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['role-permissions'] });
      toast.success(`Permissions updated for ${data.role}`);
    },
    onError: (error) => {
      console.error('Error updating role permissions:', error);
      toast.error('Failed to update role permissions');
    },
  });
};
