
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface CreateInvitationParams {
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'contractor';
}

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ email, role }: CreateInvitationParams) => {
      console.log('Creating invitation:', { email, role });

      if (!userProfile?.tenant_id) {
        throw new Error('No tenant ID found');
      }

      // Generate a unique token for the invitation
      const token = crypto.randomUUID();

      const { data, error } = await supabase
        .from('user_invitations')
        .insert({
          email,
          role,
          tenant_id: userProfile.tenant_id,
          invited_by: userProfile.id,
          token,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        throw error;
      }

      console.log('Invitation created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
};
