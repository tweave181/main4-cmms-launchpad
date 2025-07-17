import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

export interface ProgramSettings {
  id: string;
  tenant_id: string;
  country?: string;
  currency?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  default_fiscal_year_start?: string;
  organization_name?: string;
  system_contact_email?: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramSettingsFormData {
  country?: string;
  currency?: string;
  language?: string;
  timezone?: string;
  date_format?: string;
  default_fiscal_year_start?: string;
  organization_name?: string;
  system_contact_email?: string;
  logo_url?: string;
}

export const useProgramSettings = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['program-settings', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant ID available');
      }

      const { data, error } = await supabase
        .from('program_settings')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching program settings:', error);
        throw error;
      }

      return data as ProgramSettings | null;
    },
    enabled: !!userProfile?.tenant_id,
  });
};

export const useCreateProgramSettings = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: ProgramSettingsFormData) => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant ID available');
      }

      const { data: result, error } = await supabase
        .from('program_settings')
        .insert({
          ...data,
          tenant_id: userProfile.tenant_id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating program settings:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-settings'] });
      toast({
        title: 'Settings created',
        description: 'Program settings have been successfully created.',
      });
    },
    onError: (error: any) => {
      console.error('Failed to create program settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to create program settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateProgramSettings = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProgramSettingsFormData }) => {
      const { data: result, error } = await supabase
        .from('program_settings')
        .update(data)
        .eq('id', id)
        .eq('tenant_id', userProfile?.tenant_id)
        .select()
        .single();

      if (error) {
        console.error('Error updating program settings:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-settings'] });
      toast({
        title: 'Settings updated',
        description: 'Program settings have been successfully updated.',
      });
    },
    onError: (error: any) => {
      console.error('Failed to update program settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update program settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
};