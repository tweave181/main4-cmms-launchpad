
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { UserProfile, Tenant } from './types';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [lastFetchedUserId, setLastFetchedUserId] = useState<string | null>(null);

  // Helper function to create missing profile using session data
  const createMissingProfile = useCallback(async (session: any) => {
    try {
      console.log('Creating missing profile for user:', session.user.id);
      
      const tenantId = session.user.user_metadata?.tenant_id;
      if (!tenantId) {
        throw new Error('No tenant_id found in session metadata');
      }

      const profileData = {
        id: session.user.id,
        tenant_id: tenantId,
        email: session.user.email,
        name: session.user.user_metadata?.name || 'User',
        role: session.user.user_metadata?.role || 'technician'
      };

      console.log('Inserting profile data:', profileData);

      const { data: newProfile, error } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error('Failed to create missing profile:', error);
        throw error;
      }

      console.log('Successfully created missing profile:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error in createMissingProfile:', error);
      throw error;
    }
  }, []);

  // Helper function to retry profile fetch with exponential backoff
  const fetchProfileWithRetry = useCallback(async (userId: string, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Profile fetch attempt ${attempt}/${maxRetries} for user:`, userId);
        
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error(`Profile fetch attempt ${attempt} failed:`, {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });

          // If it's the last attempt, throw the error
          if (attempt === maxRetries) {
            throw error;
          }

          // Wait before retrying (exponential backoff: 500ms, 1s, 2s)
          const delay = Math.pow(2, attempt - 1) * 500;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        if (profile) {
          console.log(`Profile fetch successful on attempt ${attempt}:`, profile);
          return profile;
        } else {
          console.log(`Profile fetch attempt ${attempt} returned null`);
          if (attempt === maxRetries) {
            return null;
          }
        }
      } catch (error) {
        console.error(`Profile fetch attempt ${attempt} threw error:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        const delay = Math.pow(2, attempt - 1) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return null;
  }, []);

  const fetchUserProfile = useCallback(async (userId: string) => {
    // Prevent duplicate fetches for the same user
    if (lastFetchedUserId === userId && userProfile) {
      console.log('Profile already fetched for this user, skipping');
      return;
    }

    try {
      setProfileLoading(true);
      console.log(`=== Starting profile fetch for user: ${userId} ===`);
      
      // Get the current session to access JWT claims
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session found during profile fetch');
        setProfileLoading(false);
        return;
      }

      // Log session details for debugging
      console.log('Session details:', {
        userId: session.user.id,
        authUid: session.user.id, // This is what auth.uid() returns
        tenantId: session.user.user_metadata?.tenant_id,
        userMetadata: session.user.user_metadata,
        appMetadata: session.user.app_metadata
      });

      // Double-check JWT claims are available
      const tenantId = session.user.user_metadata?.tenant_id;
      if (!tenantId) {
        console.error('No tenant_id found in JWT claims, aborting profile fetch');
        setProfileLoading(false);
        return;
      }

      console.log('JWT claims confirmed, proceeding with profile fetch. Tenant ID:', tenantId);

      // Attempt to fetch user profile with retry logic
      let profile;
      try {
        profile = await fetchProfileWithRetry(userId);
      } catch (error: any) {
        console.error('Profile fetch failed after all retries:', error);

        // Check if this is a "row not found" error (PGRST116 or similar)
        if (error.code === 'PGRST116' || error.message?.includes('no rows returned')) {
          console.log('Profile not found, attempting to create missing profile...');
          
          try {
            profile = await createMissingProfile(session);
            console.log('Successfully created and retrieved missing profile');
          } catch (createError) {
            console.error('Failed to create missing profile:', createError);
            toast({
              title: "Profile Creation Error",
              description: "Unable to create your profile. Please contact support.",
              variant: "destructive",
            });
            setProfileLoading(false);
            return;
          }
        } else {
          // Some other error occurred
          toast({
            title: "Profile Loading Error",
            description: "Unable to load your profile. Please try logging in again.",
            variant: "destructive",
          });
          setProfileLoading(false);
          throw error;
        }
      }

      if (!profile) {
        console.error('No profile found and creation failed for user:', userId);
        toast({
          title: "Profile Not Found",
          description: "Your user profile was not found. Please contact support.",
          variant: "destructive",
        });
        setProfileLoading(false);
        return;
      }

      console.log('User profile ready:', profile);
      setUserProfile(profile);
      setLastFetchedUserId(userId);

      // Fetch tenant data using the new JWT-based policy
      if (profile?.tenant_id) {
        console.log('Fetching tenant data for:', profile.tenant_id);
        
        const { data: tenantData, error: tenantError } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profile.tenant_id)
          .single();

        if (tenantError) {
          console.error('Error fetching tenant:', tenantError);
          toast({
            title: "Organization Data Error",
            description: "Unable to load organization information.",
            variant: "destructive",
          });
        } else {
          console.log('Tenant data fetched successfully:', tenantData);
          setTenant(tenantData);
        }
      }
      
      console.log('=== Profile fetch completed successfully ===');
      setProfileLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUserProfile(null);
      setTenant(null);
      setLastFetchedUserId(null);
      setProfileLoading(false);
    }
  }, [userProfile, lastFetchedUserId, fetchProfileWithRetry, createMissingProfile]);

  const clearUserData = useCallback(() => {
    console.log('Clearing user data');
    setUserProfile(null);
    setTenant(null);
    setProfileLoading(false);
    setLastFetchedUserId(null);
  }, []);

  return {
    userProfile,
    tenant,
    profileLoading,
    fetchUserProfile,
    clearUserData
  };
};
