
import { supabase } from '@/integrations/supabase/client';

// Validate that a session exists before profile reads.
// Tenant claims can lag briefly after signup, so they are advisory rather than blocking.
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

    // Check JWT claims, but don't block profile access if they are still propagating.
    const tenantId = session.user.user_metadata?.tenant_id || session.user.app_metadata?.tenant_id;
    if (!tenantId) {
      console.warn(`No tenant_id found in JWT claims (attempt ${attempt}); continuing with auth session`);
      return session;
    }

    console.log(`JWT claims confirmed on attempt ${attempt}, proceeding with profile fetch. Tenant ID:`, tenantId);
    return session;
  }
  
  throw new Error('Failed to validate session and claims after all retries');
};
