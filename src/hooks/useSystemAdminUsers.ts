import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SystemAdminUser {
  userId: string;
  userName: string;
  email: string;
  tenantId: string;
  tenantName: string;
  roleAssignedAt: string;
  assignedBy: string | null;
  assignedByName: string | null;
}

export const useSystemAdminUsers = () => {
  return useQuery({
    queryKey: ['systemAdminUsers'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('admin_get_all_system_admins');
      if (error) throw error;
      return (data || []).map((row: any) => ({
        userId: row.user_id,
        userName: row.user_name,
        email: row.email,
        tenantId: row.tenant_id,
        tenantName: row.tenant_name,
        roleAssignedAt: row.role_assigned_at,
        assignedBy: row.assigned_by,
        assignedByName: row.assigned_by_name,
      })) as SystemAdminUser[];
    }
  });
};
