import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EmailDeliveryLog } from '@/types/email';

export const useRecentEmailActivity = () => {
  return useQuery({
    queryKey: ['recent-email-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_delivery_log')
        .select(`
          *,
          recipient_user:users!email_delivery_log_recipient_user_id_fkey(name),
          template:email_templates(template_type, template_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Transform the data to flatten the joined relationships
      return (data || []).map((log: any) => ({
        ...log,
        recipient_name: log.recipient_user?.name,
        template_type: log.template?.template_type,
        template_name: log.template?.template_name,
      })) as EmailDeliveryLog[];
    },
  });
};
