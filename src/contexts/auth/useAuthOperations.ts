
import { supabase } from '@/integrations/supabase/client';

// Add rate limit awareness to auth flows (signUp/signIn/signOut)
export const useAuthOperations = () => {
  const signUp = async (email: string, password: string, name: string, tenantName: string, tenantSlug: string) => {
    try {
      // Use the trigger-based approach by passing metadata
      // The handle_new_user function will now properly set JWT claims
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            tenant_name: tenantName, // This will trigger tenant creation
            role: 'admin' // First user in tenant is admin
          }
        }
      });

      if (authError) {
        if (authError.status === 429 || (authError.message && authError.message.toLowerCase().includes("rate limit"))) {
          console.warn("[RateLimit] Sign up failed: hit rate limit");
          throw new Error("We are receiving too many requests. Please try again soon.");
        }
        throw authError;
      }
      console.log('Signup successful, user created:', authData.user?.id);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.status === 429 || (error.message && error.message.toLowerCase().includes("rate limit"))) {
          console.warn("[RateLimit] Sign in failed: hit rate limit");
          throw new Error("We're at our connection limit. Try again in a moment.");
        }
        throw error;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      // Check if session exists before attempting logout
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn("[SignOut] Session check failed:", sessionError);
        // Continue with signOut even if session check fails
      }

      if (!session) {
        console.log("[SignOut] No active session found, proceeding with cleanup");
        // No session exists, but still call signOut for cleanup
      }

      const { error } = await supabase.auth.signOut();
      if (error) {
        if (error.status === 429 || (error.message && error.message.toLowerCase().includes("rate limit"))) {
          console.warn("[RateLimit] Sign out failed: hit rate limit");
          // Don't throw for rate limit during logout - user should be signed out anyway
          return;
        }
        
        // For other errors during signOut, log but don't throw
        console.warn("[SignOut] Sign out error:", error);
        return;
      }
      
      console.log("[SignOut] Successfully signed out");
    } catch (error: any) {
      // Log error but don't throw - logout should appear successful to user
      console.error("[SignOut] Logout error:", error);
    }
  };

  return {
    signUp,
    signIn,
    signOut
  };
};
