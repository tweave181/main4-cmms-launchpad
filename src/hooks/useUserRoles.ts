import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export type AppRole = 'system_admin' | 'admin' | 'manager' | 'technician' | 'contractor';

export const useUserRoles = (user: User | null) => {
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

export const useHasRole = (user: User | null, role: AppRole) => {
  const { data: roles = [] } = useUserRoles(user);
  return roles.includes(role);
};

export const useIsSystemAdmin = (user: User | null) => {
  return useHasRole(user, 'system_admin');
};