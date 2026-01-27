
import { supabase } from '@/integrations/supabase/client';

// Fix: Enhanced session validation with retry logic for JWT claims
export const validateSessionAndClaims = async (userId: string, retries = 3) => {
  console.log(`=== Starting profile fetch for user: ${userId} (retries left: ${retries}) ===`);
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    // Get the current session to access JWT claims
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error(`No active session found during profile fetch (attempt ${attempt})`);
      if (attempt === retries) {
        throw new Error('No active session found');
      }
      // Wait before retry - JWT claims might be propagating
      await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      continue;
    }

    // Log session details for debugging
    console.log(`Session details (attempt ${attempt}):`, {
      userId: session.user.id,
      authUid: session.user.id, // This is what auth.uid() returns
      tenantId: session.user.user_metadata?.tenant_id,
      userMetadata: session.user.user_metadata,
      appMetadata: session.user.app_metadata
    });

    // Check JWT claims with retry logic
    const tenantId = session.user.user_metadata?.tenant_id || session.user.app_metadata?.tenant_id;
    if (!tenantId) {
      console.warn(`No tenant_id found in JWT claims (attempt ${attempt})`);
      if (attempt === retries) {
        console.error('No tenant_id found in JWT claims after all retries, aborting profile fetch');
        throw new Error('No tenant_id found in JWT claims');
      }
      // Wait before retry - JWT might be updating
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      continue;
    }

    console.log(`JWT claims confirmed on attempt ${attempt}, proceeding with profile fetch. Tenant ID:`, tenantId);
    return session;
  }
  
  throw new Error('Failed to validate session and claims after all retries');
};
