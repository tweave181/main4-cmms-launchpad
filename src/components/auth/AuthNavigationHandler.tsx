import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth';

export const AuthNavigationHandler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profileStatus } = useAuth();
  const notifiedRef = useRef(false);

  useEffect(() => {
    if (profileStatus === 'expired' && !notifiedRef.current) {
      notifiedRef.current = true;
      toast.error('Session expired', {
        description: 'Your session is no longer valid. Please sign in again.',
        duration: 6000,
      });
      const isOnAuth = location.pathname.startsWith('/auth');
      if (!isOnAuth) {
        navigate('/auth?expired=1', { replace: true });
      }
    }
    if (profileStatus !== 'expired') {
      notifiedRef.current = false;
    }
  }, [profileStatus, navigate, location.pathname]);

  return null;
};