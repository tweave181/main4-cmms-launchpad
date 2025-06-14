
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

// Helper function to validate JWT claims
const hasValidJWTClaims = (session: any): boolean => {
  if (!session?.user) return false;
  
  // Check if user metadata contains tenant_id (which gets added to JWT claims)
  const tenantId = session.user.user_metadata?.tenant_id || session.user.app_metadata?.tenant_id;
  const isValid = !!tenantId;
  
  console.log('JWT claims validation:', {
    hasSession: !!session,
    hasUser: !!session?.user,
    tenantId,
    isValid,
    userMetadata: session?.user?.user_metadata,
    appMetadata: session?.user?.app_metadata
  });
  
  return isValid;
};

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const { userProfile, tenant, profileLoading, fetchUserProfile, clearUserData } = useUserProfile();

  // Memoized function to handle session validation and profile fetching
  const handleSessionReady = useCallback(async (session: any) => {
    if (!session?.user) {
      console.log('No session or user, clearing data');
      setReady(false);
      clearUserData();
      return;
    }

    // Wait a bit longer for JWT claims to be properly set, especially for new signups
    if (!hasValidJWTClaims(session)) {
      console.log('Session found but JWT claims not ready yet, will retry...');
      setReady(false);
      
      // For new signups, give more time for the database trigger to complete
      setTimeout(async () => {
        const { data: { session: refreshedSession } } = await supabase.auth.getSession();
        if (refreshedSession && hasValidJWTClaims(refreshedSession)) {
          console.log('JWT claims now ready after retry, fetching profile');
          setReady(true);
          try {
            await fetchUserProfile(refreshedSession.user.id);
          } catch (error) {
            console.error('Failed to fetch user profile after retry:', error);
          }
        } else {
          console.log('JWT claims still not ready after retry');
          setReady(false);
        }
      }, 1500);
      return;
    }

    console.log('Session and JWT claims are ready, fetching profile for:', session.user.id);
    setReady(true);
    
    try {
      await fetchUserProfile(session.user.id);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  }, [fetchUserProfile, clearUserData]);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;
        
        console.log('Initial session check:', session ? 'User logged in' : 'No session');
        setUser(session?.user ?? null);
        setSessionInitialized(true);
        
        if (session?.user) {
          await handleSessionReady(session);
        } else {
          setReady(false);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error during auth initialization:', error);
        if (mounted) {
          setLoading(false);
          setReady(false);
          setSessionInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('Auth state changed:', event, session ? 'User logged in' : 'No session');
      setUser(session?.user ?? null);
      setSessionInitialized(true);
      
      if (session?.user) {
        // For new signups, add a delay to ensure the trigger has completed
        if (event === 'SIGNED_IN') {
          console.log('New sign-in detected, adding delay for database trigger completion');
          setTimeout(async () => {
            if (mounted) {
              await handleSessionReady(session);
            }
          }, 2000);
        } else {
          await handleSessionReady(session);
        }
      } else {
        console.log('No session, clearing user data');
        setReady(false);
        clearUserData();
      }
      
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleSessionReady]);

  return {
    user,
    userProfile,
    tenant,
    loading: loading || (user && !ready),
    ready,
    sessionInitialized
  };
};
