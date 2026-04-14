import React, { useState, useEffect, useCallback, useRef } from 'react';
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

// Add short-lived local rate limit backoff flag
const RATE_LIMIT_BACKOFF_KEY = 'lovableRateLimitBackoff';
const RATE_LIMIT_BACKOFF_DURATION = 2500;

export type ProfileStatus = 'loading' | 'ready' | 'missing' | 'error' | 'expired' | 'rate-limit';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>('loading');
  const [profileError, setProfileError] = useState<string | null>(null);
  const { userProfile, tenant, profileLoading, fetchUserProfile, clearUserData } = useUserProfile();
  
  const [backoffActive, setBackoffActive] = useState(false);
  const backoffTimeout = useRef<NodeJS.Timeout | null>(null);
  // local (per tab) session validation cache
  const sessionChecked = useRef<string | null>(null);

  // Helper to apply a backoff: disables auth/profile reload during rate limit window
  const activateBackoff = useCallback((msg?: string) => {
    setProfileStatus('rate-limit');
    setProfileError(msg ?? "We’re reconnecting you. Please wait...");
    setBackoffActive(true);
    localStorage.setItem(RATE_LIMIT_BACKOFF_KEY, Date.now().toString()); // simple flag

    // Reset after N ms
    if (backoffTimeout.current) clearTimeout(backoffTimeout.current);
    backoffTimeout.current = setTimeout(() => {
      setBackoffActive(false);
      setProfileStatus('loading');
      setProfileError(null);
      localStorage.removeItem(RATE_LIMIT_BACKOFF_KEY);
    }, RATE_LIMIT_BACKOFF_DURATION);
  }, []);

  // Helper to handle forced logout on expired/invalid session
  const handleExpiredSession = useCallback(async (customMsg?: string) => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    setReady(false);
    setProfileStatus('expired');
    setProfileError(customMsg || 'You were logged out. Please sign in again.');
    clearUserData();
  }, [clearUserData]);

  // Fix: Streamlined session handling to prevent validation loops
  const handleSessionReady = useCallback(async (session: any) => {
    if (!session?.user) {
      setReady(false);
      setProfileStatus('loading');
      setProfileError(null);
      clearUserData();
      return;
    }

    // Prevent redundant validation for the same session token
    if (sessionChecked.current === session.access_token) {
      console.log('Session already validated, skipping re-validation');
      setReady(true);
      return;
    }
    
    // Don’t block app access on delayed tenant claims; the profile query can recover tenant context.
    const tenantId = session.user.user_metadata?.tenant_id || session.user.app_metadata?.tenant_id;
    if (!tenantId) {
      console.warn('No tenant_id in JWT claims yet, continuing with profile-based recovery');
    }

    sessionChecked.current = session.access_token;
    setReady(true);
    setProfileStatus('loading');
    setProfileError(null);

    // Fix: Fetch profile with improved error handling and backoff for missing profiles
    try {
      await fetchUserProfile(session.user.id);
    } catch (error: any) {
      // 429 = Rate Limit. Activate backoff.
      if (error?.status === 429 || error?.message?.includes('rate limit')) {
        activateBackoff("We hit a temporary connection limit. Retrying...");
        return;
      }
      // Session expiry errors - trigger logout flow
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
      // Other errors - set error state but don't logout
      console.error('Profile fetch error:', error);
      setProfileError(error.message || 'Failed to load profile');
      setProfileStatus('error');
    }
  }, [fetchUserProfile, clearUserData, activateBackoff, handleExpiredSession]);

  // Retry, respecting rate limit
  const retryProfileFetch = useCallback(async () => {
    // Short-circuit if rate limit window is active
    const backoffUntil = parseInt(localStorage.getItem(RATE_LIMIT_BACKOFF_KEY) || '0', 10);
    if (backoffActive || (backoffUntil && (Date.now() - backoffUntil < RATE_LIMIT_BACKOFF_DURATION))) {
      setProfileStatus('rate-limit');
      setProfileError("We’re reconnecting you. Please wait...");
      return;
    }
    if (user) {
      setProfileStatus('loading');
      setProfileError(null);
      try {
        await fetchUserProfile(user.id);
      } catch (error: any) {
        if (
          error?.status === 429 || error?.message?.includes('rate limit')
        ) {
          activateBackoff();
          return;
        }
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
  }, [user, backoffActive, fetchUserProfile, activateBackoff, handleExpiredSession]);

  useEffect(() => {
    if (!loading && ready && !profileLoading) {
      if (profileStatus === 'rate-limit') return; // stay on reconnecting message
      if (userProfile) {
        setProfileStatus('ready');
        setProfileError(null);
      } else if (profileError) {
        setProfileStatus('error');
      } else {
        setProfileStatus('missing');
      }
    }
  }, [userProfile, loading, ready, profileLoading, profileError, profileStatus]);

  // Use refs to avoid dependency churn in the main effect
  const handleSessionReadyRef = useRef(handleSessionReady);
  handleSessionReadyRef.current = handleSessionReady;
  const clearUserDataRef = useRef(clearUserData);
  clearUserDataRef.current = clearUserData;
  const activateBackoffRef = useRef(activateBackoff);
  activateBackoffRef.current = activateBackoff;
  const handleExpiredSessionRef = useRef(handleExpiredSession);
  handleExpiredSessionRef.current = handleExpiredSession;

  useEffect(() => {
    let mounted = true;

    const handleInitialSession = async (session: any) => {
      if (!mounted) return;
      
      if (!session?.user) {
        setUser(null);
        setReady(false);
        setProfileStatus('loading');
        setProfileError(null);
        clearUserDataRef.current();
        return;
      }

      setUser(session.user);
      await handleSessionReadyRef.current(session);
    };

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        await handleInitialSession(session);
        setLoading(false);
      } catch (error) {
        if (!mounted) return;
        console.error('Auth initialization error:', error);
        setLoading(false);
        setReady(false);
        setProfileStatus('error');
        setProfileError('Failed to initialize authentication');
      }
    };

    const handleStorage = () => {
      const backoffUntil = parseInt(localStorage.getItem(RATE_LIMIT_BACKOFF_KEY) || '0', 10);
      if (backoffUntil && (Date.now() - backoffUntil < RATE_LIMIT_BACKOFF_DURATION)) {
        setProfileStatus('rate-limit');
        setProfileError("We're reconnecting you. Please wait...");
        setBackoffActive(true);
      } else {
        setProfileStatus('loading');
        setProfileError(null);
        setBackoffActive(false);
      }
    };
    window.addEventListener('storage', handleStorage);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setReady(false);
        setProfileStatus('loading');
        setProfileError(null);
        clearUserDataRef.current();
        setLoading(false);
        return;
      }

      setUser(session.user);
      setTimeout(async () => {
        await handleSessionReadyRef.current(session);
      }, 0);

      if (event === 'SIGNED_IN') {
        setTimeout(async () => {
          try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (!currentUser) return;

            await supabase
              .from('users')
              .update({ last_login: new Date().toISOString() })
              .eq('id', currentUser.id);
            
            await supabase
              .from('audit_logs')
              .insert({
                user_id: currentUser.id,
                action: 'login',
                details: {
                  entity_type: 'user',
                  entity_id: currentUser.id,
                  user_agent: navigator.userAgent,
                },
              } as any);
          } catch (error) {
            console.error('Login logging failed:', error);
          }
        }, 2000);
      }

      setLoading(false);
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorage);
      if (backoffTimeout.current) clearTimeout(backoffTimeout.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
