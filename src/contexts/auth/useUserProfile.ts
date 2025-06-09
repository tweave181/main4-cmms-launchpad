
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { UserProfile, Tenant } from './types';

export const useUserProfile = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      console.log(`Fetching user profile for ${userId}`);
      
      // Get the current session to access JWT claims
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No active session found');
        setProfileLoading(false);
        return;
      }

      // Fetch user profile using the new RLS policies
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Profile Loading Error",
          description: "Unable to load your profile. Please try logging in again.",
          variant: "destructive",
        });
        setProfileLoading(false);
        throw error;
      }

      if (!profile) {
        console.error('No profile found for user:', userId);
        toast({
          title: "Profile Not Found",
          description: "Your user profile was not found. Please contact support.",
          variant: "destructive",
        });
        setProfileLoading(false);
        return;
      }

      console.log('User profile fetched successfully:', profile);
      setUserProfile(profile);

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
      
      setProfileLoading(false);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUserProfile(null);
      setTenant(null);
      setProfileLoading(false);
    }
  };

  const clearUserData = () => {
    setUserProfile(null);
    setTenant(null);
    setProfileLoading(false);
  };

  return {
    userProfile,
    tenant,
    profileLoading,
    fetchUserProfile,
    clearUserData
  };
};
