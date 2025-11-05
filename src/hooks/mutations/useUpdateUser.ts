import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { logWarning } from '@/utils/errorHandling';
import type { Database } from '@/integrations/supabase/types';

type UserUpdate = Partial<Database['public']['Tables']['users']['Update']>;

interface UpdateUserParams {
  userId: string;
  updates: UserUpdate;
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: UpdateUserParams) => {
      // Fetch previous state from cache (best effort)
      const prev = queryClient.getQueryData<any>(['users']) as any[] | undefined;
      const before = prev?.find((u) => u.id === userId) || null;

      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      try {
        const { data: auth } = await supabase.auth.getUser();
        const changes: Record<string, any> = {};
        Object.keys(updates).forEach((k) => {
          changes[k] = { before: before ? before[k] : undefined, after: (updates as any)[k] };
        });
        await (supabase as any).from('audit_logs').insert({
          user_id: auth.user?.id,
          action: 'profile.update',
          entity_type: 'user',
          entity_id: userId,
          changes,
        });
      } catch (e) {
        logWarning('Audit log insert failed (profile.update)', 'useUpdateUser', { error: e, userId });
      }

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch users data
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
