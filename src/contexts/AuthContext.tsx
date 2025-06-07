
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface UserProfile {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'technician';
  created_at: string;
  updated_at: string;
}

interface Tenant {
  id: string;
  name: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  tenant: Tenant | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, tenantName: string, tenantSlug: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    try {
      console.log(`Fetching user profile for ${userId}, attempt ${retryCount + 1}`);
      
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        if (retryCount < maxRetries) {
          console.log(`Retrying profile fetch in ${retryDelay}ms...`);
          setTimeout(() => {
            fetchUserProfile(userId, retryCount + 1);
          }, retryDelay);
          return;
        }
        
        toast({
          title: "Profile Error",
          description: "Unable to load user profile. Please try refreshing the page.",
          variant: "destructive",
        });
        throw error;
      }

      if (!profile) {
        console.error('No profile found for user:', userId);
        
        if (retryCount < maxRetries) {
          setTimeout(() => {
            fetchUserProfile(userId, retryCount + 1);
          }, retryDelay);
          return;
        }
        
        toast({
          title: "Profile Error",
          description: "User profile not found. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      console.log('User profile fetched successfully:', profile);
      setUserProfile(profile);

      // Fetch tenant data
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
            title: "Tenant Error",
            description: "Unable to load organization data.",
            variant: "destructive",
          });
        } else {
          console.log('Tenant data fetched successfully:', tenantData);
          setTenant(tenantData);
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUserProfile(null);
      setTenant(null);
    }
  };

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
        // Add a small delay for signup events to ensure the trigger has completed
        if (event === 'SIGNED_IN') {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 1000);
        } else {
          await fetchUserProfile(session.user.id);
        }
      } else {
        setUserProfile(null);
        setTenant(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  // Check if user is admin based on their role in the database
  const isAdmin = userProfile?.role === 'admin';

  const value = {
    user,
    userProfile,
    tenant,
    loading,
    signUp,
    signIn,
    signOut,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
