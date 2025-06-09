
import { useState, useEffect } from 'react';
import { User, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { userProfile, tenant, profileLoading, fetchUserProfile, clearUserData } = useUserProfile();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session ? 'User logged in' : 'No session');
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session ? 'User logged in' : 'No session');
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // For new signups, add a delay to ensure the trigger has completed
        if (event === AuthChangeEvent.SIGNED_UP) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 2000);
        } else {
          await fetchUserProfile(session.user.id);
        }
      } else {
        clearUserData();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, clearUserData]);

  return {
    user,
    userProfile,
    tenant,
    loading: loading || profileLoading
  };
};
