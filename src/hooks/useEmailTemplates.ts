import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

export interface EmailTemplate {
  id: string;
  tenant_id: string;
  template_type: string;
  template_name: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  is_active: boolean;
  is_default: boolean;
  variables: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplateFormData {
  template_type: string;
  template_name: string;
  subject: string;
  body_html: string;
  body_text?: string;
  is_active?: boolean;
  variables?: string[];
}

export const useEmailTemplates = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['email-templates', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant ID available');
      }

      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .order('template_type', { ascending: true });

      if (error) throw error;
      return data as EmailTemplate[];
    },
    enabled: !!userProfile?.tenant_id,
  });
};

export const useCreateEmailTemplate = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: EmailTemplateFormData) => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant ID available');
      }

      const { data: result, error } = await supabase
        .from('email_templates')
        .insert({
          ...data,
          tenant_id: userProfile.tenant_id,
          created_by: userProfile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: 'Template created',
        description: 'Email template has been successfully created.',
      });
    },
    onError: (error: any) => {
      console.error('Failed to create email template:', error);
      toast({
        title: 'Error',
        description: 'Failed to create email template. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmailTemplateFormData> }) => {
      const { data: result, error } = await supabase
        .from('email_templates')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: 'Template updated',
        description: 'Email template has been successfully updated.',
      });
    },
    onError: (error: any) => {
      console.error('Failed to update email template:', error);
      toast({
        title: 'Error',
        description: 'Failed to update email template. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteEmailTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      toast({
        title: 'Template deleted',
        description: 'Email template has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      console.error('Failed to delete email template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete email template. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
