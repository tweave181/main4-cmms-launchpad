import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from the URL hash (Supabase auth redirects with tokens in hash)
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          navigate('/auth?error=verification_failed');
          return;
        }

        if (session) {
          // User is verified and logged in
          console.log('Email verified successfully, redirecting to home');
          navigate('/');
        } else {
          // No session, redirect to auth
          navigate('/auth');
        }
      } catch (err) {
        console.error('Auth callback exception:', err);
        navigate('/auth?error=callback_failed');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Verifying your email...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
