import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/hooks/use-toast';

export interface WorkOrderComment {
  id: string;
  work_order_id: string;
  user_id: string;
  comment: string;
  comment_type: 'comment' | 'status_change' | 'assignment' | 'time_log';
  created_at: string;
  comment_status?: 'open' | 'closed' | null;
  comment_time_created?: string | null;
  comment_time_worked?: string | null;
  comment_time_closed?: string | null;
  user?: { name: string };
}

export interface CreateCommentData {
  work_order_id: string;
  comment: string;
  comment_type: 'comment' | 'status_change' | 'assignment' | 'time_log';
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

      if (error) {
        console.error('Error fetching work order comments:', error);
        throw error;
      }

      return data as WorkOrderComment[];
    },
    enabled: !!workOrderId,
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

      if (error) {
        console.error('Error creating work order comment:', error);
        throw error;
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['work-order-comments', result.work_order_id] });
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Create comment error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });
};