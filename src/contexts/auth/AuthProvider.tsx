
import React, { createContext, useContext } from 'react';
import { useAuthState, ProfileStatus } from './useAuthState';
import { useAuthOperations } from './useAuthOperations';
import type { AuthContextType } from './types';

// Extended AuthContextType to include profile status
interface ExtendedAuthContextType extends AuthContextType {
  profileStatus: ProfileStatus;
  profileError: string | null;
  retryProfileFetch: () => Promise<void>;
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
    retryProfileFetch
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
