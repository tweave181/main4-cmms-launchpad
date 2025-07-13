import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Fix: Make navigate usage conditional to prevent Router context errors
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn('useNavigate called outside Router context, navigation disabled');
  }
  
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

  // Helper to handle forced logout + redirect on expired/invalid session
  const handleExpiredSession = useCallback(async (customMsg?: string) => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    setUser(null);
    setReady(false);
    setProfileStatus('expired');
    setProfileError(customMsg || 'You were logged out. Please sign in again.');
    clearUserData();
    // Fix: Only navigate if Router context is available
    if (navigate) {
      navigate("/?expired=1", { replace: true });
    }
  }, [clearUserData, navigate]);

  // Memoized function to handle session validation and profile fetching, with 429/401 awareness
  const handleSessionReady = useCallback(async (session: any) => {
    if (!session?.user) {
      setReady(false);
      setProfileStatus('loading');
      setProfileError(null);
      clearUserData();
      return;
    }

    // Only check claims once per session
    if (sessionChecked.current === session.access_token) {
      // Already checked for this session/token
      setReady(true);
      setProfileStatus('loading');
      setProfileError(null);
    } else {
      if (!hasValidJWTClaims(session)) {
        setReady(false);
        setProfileStatus('loading');
        return;
      }
      sessionChecked.current = session.access_token;
      setReady(true);
      setProfileStatus('loading');
      setProfileError(null);
    }

    // Try fetching the profile, with error signaling handled in catching block
    try {
      await fetchUserProfile(session.user.id);
    } catch (error: any) {
      // 429 = Rate Limit. Activate backoff.
      if (error?.status === 429 || error?.message?.includes('rate limit')) {
        activateBackoff("We hit a temporary connection limit. Retrying...");
        return;
      }
      // Usual session expiry errors
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

  useEffect(() => {
    let mounted = true;

    // Remove extra/session-refresh logic!
    const handleInitialSession = async (session: any) => {
      if (!session?.user) {
        setUser(null);
        setReady(false);
        setProfileStatus('loading');
        setProfileError(null);
        clearUserData();
        return;
      }

      setUser(session.user);
      await handleSessionReady(session);
    };

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

    // Handle 429 (rate limit) from other tabs
    const handleStorage = () => {
      const backoffUntil = parseInt(localStorage.getItem(RATE_LIMIT_BACKOFF_KEY) || '0', 10);
      if (backoffUntil && (Date.now() - backoffUntil < RATE_LIMIT_BACKOFF_DURATION)) {
        setProfileStatus('rate-limit');
        setProfileError("We’re reconnecting you. Please wait...");
        setBackoffActive(true);
      } else if (backoffActive) {
        setProfileStatus('loading');
        setProfileError(null);
        setBackoffActive(false);
      }
    };
    window.addEventListener('storage', handleStorage);

    // Listen for auth changes (without preventive session refresh!)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        setReady(false);
        setProfileStatus('loading');
        setProfileError(null);
        clearUserData();
        if (event === "SIGNED_OUT") {
          // Fix: Only navigate if Router context is available
          if (navigate) {
            navigate("/?expired=1", { replace: true });
          }
        }
        setLoading(false);
        return;
      }

      setUser(session.user);
      setTimeout(async () => {
        await handleSessionReady(session);
      }, 0);

      setLoading(false);
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorage);
      if (backoffTimeout.current) clearTimeout(backoffTimeout.current);
    };
  }, [handleSessionReady, clearUserData, activateBackoff, handleExpiredSession, navigate, backoffActive]);

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
