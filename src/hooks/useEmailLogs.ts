import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EmailDeliveryLog } from '@/types/email';

interface UseEmailLogsParams {
  status?: string;
  templateType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export const useEmailLogs = (params: UseEmailLogsParams = {}) => {
  const {
    status,
    templateType,
    search,
    startDate,
    endDate,
    page = 1,
    pageSize = 50,
  } = params;

  return useQuery({
    queryKey: ['email-logs', status, templateType, search, startDate, endDate, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('email_delivery_log')
        .select(`
          *,
          recipient_user:users!email_delivery_log_recipient_user_id_fkey(name),
          template:email_templates(template_type, template_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (status) {
        query = query.eq('delivery_status', status);
      }

      if (templateType) {
        query = query.eq('template.template_type', templateType);
      }

      if (search) {
        query = query.or(`recipient_email.ilike.%${search}%,subject.ilike.%${search}%`);
      }

      if (startDate) {
        query = query.gte('created_at', startDate);
      }

      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform the data to flatten the joined relationships
      const transformedData = (data || []).map((log: any) => ({
        ...log,
        recipient_name: log.recipient_user?.name,
        template_type: log.template?.template_type,
        template_name: log.template?.template_name,
      })) as EmailDeliveryLog[];

      return {
        data: transformedData,
        total: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      };
    },
  });
};
