
import { supabase } from '@/integrations/supabase/client';

export const useAuthOperations = () => {
  const signUp = async (email: string, password: string, name: string, tenantName: string, tenantSlug: string) => {
    try {
      // Use the trigger-based approach by passing metadata
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

      if (authError) throw authError;

      // The trigger function will handle creating the tenant and user profile
      console.log('Signup successful, user created:', authData.user?.id);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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
