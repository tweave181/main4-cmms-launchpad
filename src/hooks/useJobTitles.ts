
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type JobTitle = Database['public']['Tables']['job_titles']['Row'];

export const useJobTitles = () => {
  const { userProfile } = useAuth();

  const { data: jobTitles, isLoading, refetch } = useQuery({
    queryKey: ['jobTitles', userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_titles')
        .select('*')
        .order('title_name', { ascending: true });

      if (error) throw error;
      return data as JobTitle[];
    },
    enabled: !!userProfile?.tenant_id,
  });

  const deleteJobTitle = async (jobTitleId: string) => {
    if (!confirm('Are you sure you want to delete this job title?')) return;

    try {
      const { error } = await supabase
        .from('job_titles')
        .delete()
        .eq('id', jobTitleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job title deleted successfully",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    jobTitles: jobTitles || [],
    isLoading,
    refetch,
    deleteJobTitle,
  };
};
