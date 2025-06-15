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
          throw new Error("We’re at our connection limit. Try again in a moment.");
        }
        throw error;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        if (error.status === 429 || (error.message && error.message.toLowerCase().includes("rate limit"))) {
          console.warn("[RateLimit] Sign out failed: hit rate limit");
          throw new Error("Could not sign out due to connection limit. Please try again soon.");
        }
        throw error;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  return {
    signUp,
    signIn,
    signOut
  };
};
