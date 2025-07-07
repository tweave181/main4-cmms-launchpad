
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page with expired flag if coming from a protected route
    const searchParams = new URLSearchParams();
    if (location.pathname !== '/') {
      searchParams.set('expired', '1');
    }
    const redirectPath = `/auth?${searchParams.toString()}`;
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
