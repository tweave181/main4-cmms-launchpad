import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

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
      toast({
        title: 'Settings updated',
        description: 'Notification settings have been successfully updated.',
      });
    },
    onError: (error: any) => {
      console.error('Failed to update notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings. Please try again.',
        variant: 'destructive',
      });
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
      toast({
        title: 'Settings created',
        description: 'Notification settings have been successfully created.',
      });
    },
    onError: (error: any) => {
      console.error('Failed to create notification settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to create notification settings. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
