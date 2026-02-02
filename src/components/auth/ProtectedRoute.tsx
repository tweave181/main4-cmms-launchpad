import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Public routes that should NEVER trigger the protected route redirect
// These should be handled by their own Route definitions
const PUBLIC_ROUTES = [
  '/auth',
  '/auth/callback',
  '/setup',
  '/customer-login',
  '/tenant-portal',
  '/portal',
  '/verify-customer-email',
  '/accept-invitation',
];

// Routes allowed during setup phase - users can navigate to these even if setup isn't complete
const SETUP_ALLOWED_ROUTES = [
  '/admin/preferences/locations',
  '/locations',
  '/admin/preferences/asset-prefixes',
  '/admin/preferences/asset-prefixes/bulk',
  '/assets',
  '/assets/bulk',
  '/users',
  '/admin/preferences/departments',
  '/admin/preferences/categories',
  '/admin/preferences/location-levels',
  '/admin/preferences/job-titles',
  '/settings',
  '/admin/checklist-library',
  '/admin/checklist-records',
  '/admin/work-schedules',
  '/address-book',
  '/admin/service-contracts',
];

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, userProfile } = useAuth();
  const tenantId = userProfile?.tenant_id;
  const location = useLocation();
  const [setupCheck, setSetupCheck] = useState<'loading' | 'needs-setup' | 'done'>('loading');

  // Check if we're on a public route (safety check in case routing matches unexpectedly)
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  useEffect(() => {
    // Skip setup check for public routes
    if (isPublicRoute) {
      setSetupCheck('done');
      return;
    }

    const checkSetupStatus = async () => {
      if (!tenantId || location.pathname === '/setup') {
        setSetupCheck('done');
        return;
      }

      try {
        // Check if setup wizard was dismissed
        const { data: settings } = await supabase
          .from('program_settings')
          .select('setup_wizard_dismissed')
          .eq('tenant_id', tenantId)
          .single();

        if (settings?.setup_wizard_dismissed) {
          setSetupCheck('done');
          return;
        }

        // Check if tenant has minimum setup (at least 1 location OR 1 asset)
        const [locationsResult, assetsResult] = await Promise.all([
          supabase.from('locations').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
          supabase.from('assets').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        ]);

        const hasLocations = (locationsResult.count || 0) > 0;
        const hasAssets = (assetsResult.count || 0) > 0;

        if (!hasLocations && !hasAssets) {
          setSetupCheck('needs-setup');
        } else {
          setSetupCheck('done');
        }
      } catch (error) {
        console.error('Error checking setup status:', error);
        setSetupCheck('done');
      }
    };

    if (user && tenantId) {
      checkSetupStatus();
    } else if (!loading) {
      setSetupCheck('done');
    }
  }, [tenantId, user, loading, location.pathname, isPublicRoute]);

  // If we're on a public route, don't apply protection (this is a safety check)
  if (isPublicRoute) {
    console.log('ProtectedRoute: Skipping protection for public route:', location.pathname);
    return <>{children}</>;
  }

  if (loading || (user && setupCheck === 'loading')) {
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

  // Redirect new tenants to setup wizard (unless on an allowed setup route)
  const isSetupAllowedRoute = SETUP_ALLOWED_ROUTES.some(route => 
    location.pathname.startsWith(route)
  );
  
  if (setupCheck === 'needs-setup' && location.pathname !== '/setup' && !isSetupAllowedRoute) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
};
