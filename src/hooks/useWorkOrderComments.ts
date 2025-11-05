import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { showSuccessToast, showErrorToast, logError } from '@/utils/errorHandling';

export interface CommentStatusOption {
  id: string;
  status_name: string;
  status_color: string;
  is_active: boolean;
  sort_order: number;
}

export interface WorkOrderComment {
  id: string;
  work_order_id: string;
  user_id: string;
  comment: string;
  comment_type: 'comment' | 'status_change' | 'assignment' | 'time_log';
  created_at: string;
  comment_status?: 'open' | 'closed' | null;
  comment_status_name?: string | null;
  comment_time_created?: string | null;
  comment_time_worked?: string | null;
  comment_time_closed?: string | null;
  user?: { name: string };
}

export interface CreateCommentData {
  work_order_id: string;
  comment: string;
  comment_type: 'comment' | 'status_change' | 'assignment' | 'time_log';
  comment_status_name?: string;
}

export const useWorkOrderComments = (workOrderId: string) => {
  return useQuery({
    queryKey: ['work-order-comments', workOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_comments')
        .select(`
          *,
          user:users!user_id(name)
        `)
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data as WorkOrderComment[];
    },
    enabled: !!workOrderId,
  });
};

export const useCommentStatusOptions = () => {
  return useQuery({
    queryKey: ['comment-status-options'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comment_status_options')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      return data as CommentStatusOption[];
    },
  });
};

export const useCreateWorkOrderComment = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateCommentData) => {
      if (!userProfile?.id) {
        throw new Error('User not authenticated');
      }

      const { data: result, error } = await supabase
        .from('work_order_comments')
        .insert({
          ...data,
          user_id: userProfile.id,
        })
        .select()
        .single();

      if (error) throw error;

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-comments', result.work_order_id] });
      showSuccessToast("Comment added successfully");
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Add Failed', context: 'Comment' });
    },
  });
};