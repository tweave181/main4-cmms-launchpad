
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useProgramSettings } from '@/hooks/useProgramSettings';

interface CreateInvitationParams {
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'technician' | 'contractor';
}

export const useCreateInvitation = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();
  const { data: settings } = useProgramSettings();

  return useMutation({
    mutationFn: async ({ name, email, role }: CreateInvitationParams) => {
      console.log('Creating invitation:', { name, email, role });

      if (!userProfile?.tenant_id) {
        throw new Error('No tenant ID found');
      }

      // Generate a unique token for the invitation
      const token = crypto.randomUUID();

      const { data, error } = await supabase
        .from('user_invitations')
        .insert({
          name,
          email,
          role,
          tenant_id: userProfile.tenant_id,
          invited_by: userProfile.id,
          token,
        })
        .select()
        .single();

      if (error) throw error;

      // Send the invitation email via edge function
      const tenantName = settings?.organization_name || 'Your Organization';
      const inviterName = userProfile.name || 'A team administrator';

      console.log('Sending invitation email via edge function');
      
      const { error: emailError } = await supabase.functions.invoke('send-user-invitation', {
        body: {
          invitationId: data.id,
          name,
          email,
          role,
          inviterName,
          tenantName,
          token,
        },
      });

      if (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't throw - invitation was created, just email failed
        // The admin can resend the invitation later
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
};
