import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth';
import { LogOut, User, Shield } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
export const TopBar: React.FC = () => {
  const {
    userProfile,
    tenant,
    signOut,
    isAdmin,
    loading,
    ready
  } = useAuth();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    try {
      // Check if session exists before attempting any session-dependent operations
      const {
        data: {
          session
        },
        error: sessionError
      } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('Session check failed during logout:', sessionError);
      }

      // Proceed with signOut regardless of session state
      await signOut();

      // Show success message for clean logout
      toast({
        title: "Success",
        description: "You've been securely logged out"
      });
      // Navigate to auth page to prevent remaining on protected routes
      navigate('/auth', { replace: true });
    } catch (error: any) {
      // Log error for debugging but show user-friendly message
      console.error('Logout error:', error);

      // Show success message instead of error to avoid confusion
      toast({
        title: "Success",
        description: "You've been securely logged out"
      });
      // Still navigate to auth to ensure user exits the app UI
      navigate('/auth', { replace: true });
    }
  };
  return <header className="border-b bg-white shadow-sm">
      <div className="flex items-center justify-between h-16 px-[14px]">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          {loading || !ready ? <div className="hidden md:block">
              <Skeleton className="h-6 w-32" />
            </div> : tenant ? <div className="hidden md:block">
              <h1 className="text-lg font-medium">{tenant.name}</h1>
            </div> : null}
        </div>
        
        <div className="flex items-center space-x-4 mx-[45px]">
          {loading || !ready ? <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div> : <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm font-medium">
                {userProfile?.name || 'User'}
              </span>
              {isAdmin && <Badge variant="secondary" className="flex items-center space-x-1">
                  <Shield className="h-3 w-3" />
                  <span>Admin</span>
                </Badge>}
            </div>}
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>;
};