import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { showSuccessToast, showErrorToast, logError } from '@/utils/errorHandling';

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
  email_provider?: string;
  email_from_name?: string;
  email_from_address?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_secure?: boolean;
  smtp_username?: string;
  email_signature?: string;
  // Site Address fields
  site_address_line_1?: string;
  site_address_line_2?: string;
  site_address_line_3?: string;
  site_town_or_city?: string;
  site_county_or_state?: string;
  site_postcode?: string;
  // Main Contact fields
  main_contact_first_name?: string;
  main_contact_surname?: string;
  main_contact_job_title?: string;
  main_contact_phone?: string;
  main_contact_mobile?: string;
  main_contact_email?: string;
  main_contact_department_id?: string;
  main_contact_department?: { id: string; name: string };
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
  email_provider?: string;
  email_from_name?: string;
  email_from_address?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_secure?: boolean;
  smtp_username?: string;
  email_signature?: string;
  // Site Address fields
  site_address_line_1?: string;
  site_address_line_2?: string;
  site_address_line_3?: string;
  site_town_or_city?: string;
  site_county_or_state?: string;
  site_postcode?: string;
  // Main Contact fields
  main_contact_first_name?: string;
  main_contact_surname?: string;
  main_contact_job_title?: string;
  main_contact_phone?: string;
  main_contact_mobile?: string;
  main_contact_email?: string;
  main_contact_department_id?: string;
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
        .select(`
          *,
          main_contact_department:main_contact_department_id(id, name)
        `)
        .eq('tenant_id', userProfile.tenant_id)
        .maybeSingle();

      if (error) throw error;

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

      if (error) throw error;

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-settings'] });
      showSuccessToast('Program settings have been successfully created.', { title: 'Settings created' });
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Create Failed', context: 'Program Settings' });
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

      if (error) throw error;

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['program-settings'] });
      showSuccessToast('Program settings have been successfully updated.', { title: 'Settings updated' });
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Update Failed', context: 'Program Settings' });
    },
  });
};