import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { showSuccessToast, showErrorToast, logError } from '@/utils/errorHandling';

export interface NotificationSettings {
  id: string;
  tenant_id: string;
  user_id: string | null;
  setting_type: 'global' | 'user';
  contract_reminders_enabled: boolean;
  contract_reminder_days: number[];
  toast_notifications_enabled: boolean;
  toast_duration: number;
  toast_position: string;
  system_notifications_enabled: boolean;
  maintenance_notifications_enabled: boolean;
  security_alerts_enabled: boolean;
  email_frequency: 'immediate' | 'daily_digest' | 'weekly_digest';
  created_at: string;
  updated_at: string;
}

export interface NotificationSettingsFormData {
  contract_reminders_enabled?: boolean;
  contract_reminder_days?: number[];
  toast_notifications_enabled?: boolean;
  toast_duration?: number;
  toast_position?: string;
  system_notifications_enabled?: boolean;
  maintenance_notifications_enabled?: boolean;
  security_alerts_enabled?: boolean;
  email_frequency?: 'immediate' | 'daily_digest' | 'weekly_digest';
}

export const useNotificationSettings = (userId?: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['notification-settings', userProfile?.tenant_id, userId],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant ID available');
      }

      const query = supabase
        .from('notification_settings')
        .select('*')
        .eq('tenant_id', userProfile.tenant_id);

      if (userId) {
        query.eq('user_id', userId);
      } else {
        query.is('user_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) throw error;
      return data as NotificationSettings | null;
    },
    enabled: !!userProfile?.tenant_id,
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      id, 
      data 
    }: { 
      id: string; 
      data: NotificationSettingsFormData 
    }) => {
      const { data: result, error } = await supabase
        .from('notification_settings')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      showSuccessToast('Notification settings have been successfully updated.', { title: 'Settings updated' });
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Update Failed', context: 'Notification Settings' });
    },
  });
};

export const useCreateNotificationSettings = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      userId, 
      data 
    }: { 
      userId?: string; 
      data: NotificationSettingsFormData 
    }) => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant ID available');
      }

      const { data: result, error } = await supabase
        .from('notification_settings')
        .insert({
          ...data,
          tenant_id: userProfile.tenant_id,
          user_id: userId || null,
          setting_type: userId ? 'user' : 'global',
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      showSuccessToast('Notification settings have been successfully created.', { title: 'Settings created' });
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Create Failed', context: 'Notification Settings' });
    },
  });
};
