
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

  const checkTitleUniqueness = async (titleName: string, excludeId?: string): Promise<boolean> => {
    let query = supabase
      .from('job_titles')
      .select('id')
      .eq('tenant_id', userProfile?.tenant_id)
      .ilike('title_name', titleName);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      console.error('Error checking title uniqueness:', error);
      return false; // Assume not unique if check fails
    }

    return data && data.length > 0;
  };

  const onSubmit = async (data: JobTitleFormData) => {
    try {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      // Check for uniqueness
      const titleExists = await checkTitleUniqueness(
        data.title_name,
        isEditing ? jobTitle!.id : undefined
      );

      if (titleExists) {
        form.setError('title_name', {
          type: 'manual',
          message: 'A job title with this name already exists',
        });
        return;
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
