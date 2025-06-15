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

import { useNavigate } from "react-router-dom";

export type ProfileStatus = 'loading' | 'ready' | 'missing' | 'error' | 'expired';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('loading');
  const [profileError, setProfileError] = useState<string | null>(null);
  const { userProfile, tenant, profileLoading, fetchUserProfile, clearUserData } = useUserProfile();
  const navigate = useNavigate();

  // Helper to handle forced logout + redirect on expired/invalid session
  const handleExpiredSession = useCallback(async (customMsg?: string) => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    setReady(false);
    setProfileStatus('expired');
    setProfileError(customMsg || 'Your session expired. Please sign in again.');
    clearUserData();
    // Go to login with message param
    navigate("/?expired=1", { replace: true });
  }, [clearUserData, navigate]);

  // Memoized function to handle session validation and profile fetching
  const handleSessionReady = useCallback(async (session: any) => {
    if (!session?.user) {
      setReady(false);
      setProfileStatus('loading');
      setProfileError(null);
      clearUserData();
      return;
    }

    if (!hasValidJWTClaims(session)) {
      setReady(false);
      setProfileStatus('loading');
      return;
    }

    setReady(true);
    setProfileStatus('loading');
    setProfileError(null);

    try {
      await fetchUserProfile(session.user.id);
    } catch (error: any) {
      // Detect token or session errors
      if (
        error?.status === 400 ||
        error?.status === 401 ||
        error?.status === 403 ||
        error?.message?.toLowerCase().includes('token') ||
        error?.message?.toLowerCase().includes('refresh') ||
        error?.message?.toLowerCase().includes('invalid') ||
        error?.message?.toLowerCase().includes('session') 
      ) {
        await handleExpiredSession();
        return;
      }

      setProfileError(error.message || 'Failed to load profile');
      setProfileStatus('error');
    }
  }, [fetchUserProfile, clearUserData, handleExpiredSession]);

  // Function to retry profile fetching with 401/403 guard
  const retryProfileFetch = useCallback(async () => {
    if (user) {
      setProfileStatus('loading');
      setProfileError(null);
      try {
        await fetchUserProfile(user.id);
      } catch (error: any) {
        if (
          error?.status === 400 ||
          error?.status === 401 ||
          error?.status === 403 ||
          error?.message?.toLowerCase().includes('token') ||
          error?.message?.toLowerCase().includes('refresh') ||
          error?.message?.toLowerCase().includes('invalid') ||
          error?.message?.toLowerCase().includes('session')
        ) {
          await handleExpiredSession();
          return;
        }
        setProfileError(error.message || 'Failed to load profile');
        setProfileStatus('error');
      }
    }
  }, [user, fetchUserProfile, handleExpiredSession]);

  // Update profile status based on userProfile state
  useEffect(() => {
    if (!loading && ready && !profileLoading) {
      if (userProfile) {
        setProfileStatus('ready');
        setProfileError(null);
      } else if (profileError) {
        setProfileStatus('error');
      } else {
        setProfileStatus('missing');
      }
    }
  }, [userProfile, loading, ready, profileLoading, profileError]);

  useEffect(() => {
    let mounted = true;

    const handleInitialSession = async (session: any) => {
      if (!session?.user) {
        setUser(null);
        setReady(false);
        setProfileStatus('loading');
        setProfileError(null);
        clearUserData();
        return;
      }

      // Try a cheap token refresh to detect locked-out state early
      try {
        // If refreshSession fails due to bad token, forcibly expire
        const { error } = await supabase.auth.refreshSession();
        if (error && (error.status === 400 ||
          (error.message && (
            error.message.toLowerCase().includes("invalid") ||
            error.message.toLowerCase().includes("refresh") ||
            error.message.toLowerCase().includes("expired")
          ))
        )) {
          await handleExpiredSession();
          return;
        }
      } catch (err: any) {
        await handleExpiredSession();
        return;
      }

      setUser(session.user);
      await handleSessionReady(session);
    };

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (!session?.user) {
          setUser(null);
          setReady(false);
          setProfileStatus('loading');
          setProfileError(null);
          clearUserData();
        } else {
          await handleInitialSession(session);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setReady(false);
        setProfileStatus('error');
        setProfileError('Failed to initialize authentication');
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setReady(false);
        setProfileStatus('loading');
        setProfileError(null);
        clearUserData();
        if (event === "SIGNED_OUT") {
          navigate("/?expired=1", { replace: true });
        }
        setLoading(false);
        return;
      }

      // Defensive check for token expiry on auth change
      setTimeout(async () => {
        try {
          const { error } = await supabase.auth.refreshSession();
          if (error && (
            error.status === 400
            || (error.message && (
              error.message.toLowerCase().includes('invalid') ||
              error.message.toLowerCase().includes('expired') ||
              error.message.toLowerCase().includes('refresh')
            ))
          )) {
            await handleExpiredSession();
            return;
          }
        } catch (err) {
          await handleExpiredSession();
          return;
        }
        setUser(session.user);
        await handleSessionReady(session);
      }, 0);

      setLoading(false);
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleSessionReady, clearUserData, handleExpiredSession, navigate]);

  return {
    user,
    userProfile,
    tenant,
    loading: loading || (user && !ready),
    ready,
    profileStatus,
    profileError,
    retryProfileFetch,
  };
};
