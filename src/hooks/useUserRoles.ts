import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export type AppRole = 'system_admin' | 'admin' | 'manager' | 'technician' | 'contractor';

export const useUserRoles = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['userRoles', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return data.map(item => item.role as AppRole);
    },
    enabled: !!user?.id,
  });
};

export const useHasRole = (role: AppRole) => {
  const { data: roles = [] } = useUserRoles();
  return roles.includes(role);
};

export const useIsSystemAdmin = () => {
  return useHasRole('system_admin');
};