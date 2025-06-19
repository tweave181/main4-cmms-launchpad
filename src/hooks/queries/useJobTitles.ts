
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const useJobTitles = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['job-titles'],
    queryFn: async () => {
      console.log('Fetching job titles...');
      
      const { data, error } = await supabase
        .from('job_titles')
        .select('*')
        .eq('tenant_id', userProfile?.tenant_id)
        .order('title_name', { ascending: true });

      if (error) {
        console.error('Error fetching job titles:', error);
        throw error;
      }

      console.log('Job titles fetched:', data);
      return data;
    },
    enabled: !!userProfile?.tenant_id,
  });
};
