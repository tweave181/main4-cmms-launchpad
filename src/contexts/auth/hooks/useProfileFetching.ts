
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import type { UserProfile } from '../types';
import { 
  createMissingProfile, 
  fetchProfileWithRetry, 
  fetchTenantData 
} from '../utils/profileHelpers';
import { validateSessionAndClaims } from '../utils/sessionValidation';

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

const MAX_RETRIES = 3;
const INITIAL_BACKOFF = 1500; // ms

export const useProfileFetching = () => {
  const [profileLoading, setProfileLoading] = useState(false);
  const [lastFetchedUserId, setLastFetchedUserId] = useState<string | null>(null);

  // Exponential backoff for 429 errors
  const fetchUserProfile = useCallback(async (
    userId: string,
    userProfile: UserProfile | null,
    setUserProfile: (profile: UserProfile | null) => void,
    setTenant: (tenant: any) => void
  ) => {
    if (lastFetchedUserId === userId && userProfile) {
      return;
    }

    let lastError: any = null;
    let attempt = 0;
    let backoff = INITIAL_BACKOFF;
    while (attempt < MAX_RETRIES) {
      try {
        setProfileLoading(true);

        // Fix: Enhanced session validation with retry logic for JWT claims propagation
        if (attempt === 0) {
          try {
            await validateSessionAndClaims(userId, 2); // 2 retries for JWT claims
          } catch (validationError: any) {
            console.error('Session validation failed:', validationError);
            throw validationError;
          }
        }

        let profile;
        try {
          profile = await fetchProfileWithRetry(userId);
        } catch (error: any) {
          // Handle rate limit 429
          if (error?.status === 429 || (typeof error.message === "string" && error.message.toLowerCase().includes('rate limit'))) {
            lastError = error;
            attempt++;
            // Toast/info only on first rate limit
            if (attempt === 1) {
              toast({
                title: "Too Many Requests",
                description: "Traffic is high, we're retrying...",
                variant: "destructive",
              });
              console.warn(`[RateLimit] Profile fetch attempt ${attempt} (429): backing off ${backoff}ms`);
            }
            await sleep(backoff);
            backoff *= 2; // exponential
            continue; // retry
          }
          // Usual session expiry / 401 errors
          if (
            error?.status === 401 ||
            error?.status === 403 ||
            error?.status === 400 ||
            (typeof error.message === "string" && (
              error.message.toLowerCase().includes("token") ||
              error.message.toLowerCase().includes("refresh") ||
              error.message.toLowerCase().includes("expired") ||
              error.message.toLowerCase().includes("session")
            ))
          ) {
            throw { status: 401, message: "Session expired." };
          }
          throw error;
        }

        if (!profile) {
          setProfileLoading(false);
          throw new Error('Your user profile could not be found or created. Please contact support.');
        }

        setUserProfile(profile);
        setLastFetchedUserId(userId);

        // fetch tenant (best effort, continue for errors)
        if (profile?.tenant_id) {
          try {
            const tenantData = await fetchTenantData(profile.tenant_id);
            setTenant(tenantData);
          } catch (tenantError: any) {
            console.error('Error fetching tenant data:', tenantError);
            toast({
              title: "Organization Data Warning",
              description: "Unable to load organization information, but you can still use the app.",
              variant: "destructive",
            });
          }
        }
        setProfileLoading(false);
        return; // success!
      } catch (error: any) {
        lastError = error;
        // 429: fall through, will retry due to loop
        if (!(error?.status === 429 || error?.message?.toLowerCase().includes('rate limit'))) break;
      }
    }

    // If we finish loop (failed retries) show soft error
    setProfileLoading(false);
    setUserProfile(null);
    setTenant(null);
    setLastFetchedUserId(null);
    if (lastError?.status === 429 || lastError?.message?.toLowerCase().includes('rate limit')) {
      toast({
        title: "Profile loading busy",
        description: "We’re having trouble loading your profile due to traffic. Please try again in a few seconds.",
        variant: "destructive",
      });
      throw { status: 429, message: "Rate limited (profile fetch)" };
    }

    throw lastError ?? new Error("Unable to access your profile. Please try again or contact support if the problem persists.");
  }, [lastFetchedUserId]);

  const clearUserData = useCallback(() => {
    setLastFetchedUserId(null);
  }, []);

  return {
    profileLoading,
    fetchUserProfile,
    clearUserData
  };
};
