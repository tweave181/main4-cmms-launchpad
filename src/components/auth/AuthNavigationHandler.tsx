import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';

export const AuthNavigationHandler: React.FC = () => {
  const navigate = useNavigate();
  const { profileStatus, profileError } = useAuth();

  useEffect(() => {
    if (profileStatus === 'expired') {
      navigate("/?expired=1", { replace: true });
    }
  }, [profileStatus, navigate]);

  // This component doesn't render anything, it just handles navigation
  return null;
};