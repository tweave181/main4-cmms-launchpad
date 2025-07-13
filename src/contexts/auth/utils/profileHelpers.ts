
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { UserProfile } from '../types';

// Helper function to create missing profile using session data
export const createMissingProfile = async (session: any): Promise<UserProfile> => {
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
};

// Fix: Enhanced profile fetching with automatic profile creation for missing profiles
export const fetchProfileWithRetry = async (userId: string, maxRetries = 2): Promise<UserProfile | null> => {
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

        // Check for specific error types
        if (error.code === 'PGRST116' || error.message?.includes('no rows returned')) {
          // Profile doesn't exist - try to create it using session data
          console.log('Profile not found, attempting to create missing profile...');
          
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const createdProfile = await createMissingProfile(session);
              console.log('Successfully created missing profile:', createdProfile);
              return createdProfile;
            } else {
              throw new Error('PROFILE_NOT_FOUND - No session available for profile creation');
            }
          } catch (createError) {
            console.error('Failed to create missing profile:', createError);
            throw new Error('PROFILE_NOT_FOUND');
          }
        }

        if (error.code === 'PGRST301' || error.message?.includes('permission denied')) {
          // Permission denied - this is not a retry-able error
          throw new Error('PROFILE_ACCESS_DENIED');
        }

        // If it's the last attempt, throw the original error
        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying (exponential backoff: 500ms, 1s)
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
          throw new Error('PROFILE_NOT_FOUND');
        }
      }
    } catch (error: any) {
      console.error(`Profile fetch attempt ${attempt} threw error:`, error);
      
      // Don't retry for specific error types
      if (error.message === 'PROFILE_NOT_FOUND' || error.message === 'PROFILE_ACCESS_DENIED') {
        throw error;
      }
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying
      const delay = Math.pow(2, attempt - 1) * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
};

// Helper function to fetch tenant data
export const fetchTenantData = async (tenantId: string) => {
  console.log('Fetching tenant data for:', tenantId);
  
  const { data: tenantData, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single();

  if (tenantError) {
    console.error('Error fetching tenant:', tenantError);
    throw tenantError;
  }

  console.log('Tenant data fetched successfully:', tenantData);
  return tenantData;
};
