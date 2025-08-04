import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/auth';

// Central timeout configuration (in milliseconds)
export const SESSION_TIMEOUT_DURATION = 15 * 60 * 1000; // 15 minutes
export const WARNING_THRESHOLD = 1 * 60 * 1000; // 1 minute

export const useSessionTimeout = () => {
  const { user, signOut } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
      warningTimeoutRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setShowWarning(false);
    clearTimers();
    await signOut();
  }, [signOut, clearTimers]);

  const resetTimer = useCallback(() => {
    if (!user) return;

    clearTimers();
    setShowWarning(false);

    // Set warning timer (show warning 1 minute before timeout)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(WARNING_THRESHOLD);

      // Start countdown for warning
      const countdownInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1000) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      // Set final logout timer
      timeoutRef.current = setTimeout(() => {
        clearInterval(countdownInterval);
        handleLogout();
      }, WARNING_THRESHOLD);
    }, SESSION_TIMEOUT_DURATION - WARNING_THRESHOLD);
  }, [user, clearTimers, handleLogout]);

  const stayLoggedIn = useCallback(() => {
    setShowWarning(false);
    resetTimer();
  }, [resetTimer]);

  // Activity detection
  useEffect(() => {
    if (!user) return;

    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners for user activity
    activities.forEach(activity => {
      document.addEventListener(activity, handleActivity, true);
    });

    // Start initial timer
    resetTimer();

    return () => {
      activities.forEach(activity => {
        document.removeEventListener(activity, handleActivity, true);
      });
      clearTimers();
    };
  }, [user, resetTimer, clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  return {
    showWarning,
    timeLeft: Math.ceil(timeLeft / 1000), // Convert to seconds
    stayLoggedIn,
    handleLogout
  };
};