
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useUsers = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      console.log('Fetching users...');
      
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('tenant_id', userProfile?.tenant_id)
        .order('name');

      if (error) {
        console.error('Error fetching users:', error);
        throw error;
      }

      console.log('Users fetched:', data);
      return data;
    },
    enabled: !!userProfile?.tenant_id,
  });
};
