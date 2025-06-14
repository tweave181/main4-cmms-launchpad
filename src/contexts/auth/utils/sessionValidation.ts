
import { supabase } from '@/integrations/supabase/client';

// Helper function to validate session and JWT claims
export const validateSessionAndClaims = async (userId: string) => {
  console.log(`=== Starting profile fetch for user: ${userId} ===`);
  
  // Get the current session to access JWT claims
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    console.error('No active session found during profile fetch');
    throw new Error('No active session found');
  }

  // Log session details for debugging
  console.log('Session details:', {
    userId: session.user.id,
    authUid: session.user.id, // This is what auth.uid() returns
    tenantId: session.user.user_metadata?.tenant_id,
    userMetadata: session.user.user_metadata,
    appMetadata: session.user.app_metadata
  });

  // Double-check JWT claims are available
  const tenantId = session.user.user_metadata?.tenant_id;
  if (!tenantId) {
    console.error('No tenant_id found in JWT claims, aborting profile fetch');
    throw new Error('No tenant_id found in JWT claims');
  }

  console.log('JWT claims confirmed, proceeding with profile fetch. Tenant ID:', tenantId);
  return session;
};
