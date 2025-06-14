
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useInvitations = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      console.log('Fetching invitations...');
      
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .eq('tenant_id', userProfile?.tenant_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }

      console.log('Invitations fetched:', data);
      return data;
    },
    enabled: !!userProfile?.tenant_id,
  });
};
