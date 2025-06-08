
import React, { createContext, useContext } from 'react';
import { useAuthState } from './useAuthState';
import { useAuthOperations } from './useAuthOperations';
import type { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, tenant, loading } = useAuthState();
  const { signUp, signIn, signOut } = useAuthOperations();

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
