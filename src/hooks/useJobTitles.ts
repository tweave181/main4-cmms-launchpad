
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

  const checkJobTitleUsage = async (jobTitleId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('job_title_id', jobTitleId)
      .limit(1);

    if (error) {
      console.error('Error checking job title usage:', error);
      return true; // Assume it's in use if we can't check
    }

    return data && data.length > 0;
  };

  const deleteJobTitle = async (jobTitleId: string) => {
    try {
      // Check if the job title is in use
      const isInUse = await checkJobTitleUsage(jobTitleId);
      
      if (isInUse) {
        toast({
          title: "Cannot Delete",
          description: "This job title is currently assigned to users and cannot be deleted.",
          variant: "destructive",
        });
        return;
      }

      if (!confirm('Are you sure you want to delete this job title?')) return;

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
    checkJobTitleUsage,
  };
};
