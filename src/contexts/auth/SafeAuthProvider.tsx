import React, { useEffect, useState } from 'react';
import { AuthProvider } from './AuthProvider';

// Fix: Wrapper component to ensure proper initialization timing
export const SafeAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Small delay to ensure QueryClient context is fully established
    // This prevents the "No QueryClient set" error during initial render
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <AuthProvider>{children}</AuthProvider>;
};