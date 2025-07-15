
import React, { createContext, useContext } from 'react';
import { useAuthState, ProfileStatus } from './useAuthState';
import { useAuthOperations } from './useAuthOperations';
import { useSimpleSystemAdminCheck } from '@/hooks/useSimpleSystemAdminCheck';
import type { AuthContextType } from './types';

// Extended AuthContextType to include profile status and system admin check
interface ExtendedAuthContextType extends AuthContextType {
  profileStatus: ProfileStatus;
  profileError: string | null;
  retryProfileFetch: () => Promise<void>;
  isSystemAdmin: boolean;
}

const AuthContext = createContext<ExtendedAuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { 
    user, 
    userProfile, 
    tenant, 
    loading, 
    ready, 
    profileStatus, 
    profileError, 
    retryProfileFetch 
  } = useAuthState();
  const { signUp, signIn, signOut } = useAuthOperations();
  // Fix: Use simple system admin check that doesn't rely on React Query
  const { isSystemAdmin } = useSimpleSystemAdminCheck(user);

  // Check if user is admin based on their role in the database
  const isAdmin = userProfile?.role === 'admin';

  const value = {
    user,
    userProfile,
    tenant,
    loading,
    ready,
    signUp,
    signIn,
    signOut,
    isAdmin,
    profileStatus,
    profileError,
    retryProfileFetch,
    isSystemAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
