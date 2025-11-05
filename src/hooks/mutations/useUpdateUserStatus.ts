import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logWarning } from '@/utils/errorHandling';

interface UpdateUserStatusParams {
  userId: string;
  status: string;
}

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: UpdateUserStatusParams) => {
      console.log('Updating user status:', { userId, status });

      const { data, error } = await supabase
        .from('users')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      console.log('User status updated successfully:', data);

      try {
        const { data: auth } = await supabase.auth.getUser();
        await (supabase as any).from('audit_logs').insert({
          user_id: auth.user?.id,
          action: 'profile.update',
          entity_type: 'user',
          entity_id: userId,
          changes: { status: { before: undefined, after: status } },
        });
      } catch (e) {
        logWarning('Audit log insert failed (status change)', 'useUpdateUserStatus', { error: e, userId });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
