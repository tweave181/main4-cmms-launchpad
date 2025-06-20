
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import type { Database } from '@/integrations/supabase/types';

type JobTitle = Database['public']['Tables']['job_titles']['Row'];
type JobTitleInsert = Database['public']['Tables']['job_titles']['Insert'];

const jobTitleSchema = z.object({
  title_name: z.string().min(1, 'Job title name is required'),
});

type JobTitleFormData = z.infer<typeof jobTitleSchema>;

interface UseJobTitleFormProps {
  jobTitle?: JobTitle | null;
  onSuccess: () => void;
}

export const useJobTitleForm = ({ jobTitle, onSuccess }: UseJobTitleFormProps) => {
  const { userProfile } = useAuth();
  const isEditing = !!jobTitle;

  const form = useForm<JobTitleFormData>({
    resolver: zodResolver(jobTitleSchema),
    defaultValues: {
      title_name: jobTitle?.title_name || '',
    },
  });

  const onSubmit = async (data: JobTitleFormData) => {
    try {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      const jobTitleData: JobTitleInsert = {
        title_name: data.title_name,
        tenant_id: userProfile.tenant_id,
      };

      if (isEditing) {
        const { error } = await supabase
          .from('job_titles')
          .update(jobTitleData)
          .eq('id', jobTitle!.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job title updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('job_titles')
          .insert(jobTitleData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Job title created successfully",
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Job title operation error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return {
    form,
    onSubmit,
    isEditing,
  };
};
