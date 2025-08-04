import React from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { SessionTimeoutWarning } from './SessionTimeoutWarning';

interface SessionTimeoutProviderProps {
  children: React.ReactNode;
}

export const SessionTimeoutProvider: React.FC<SessionTimeoutProviderProps> = ({ children }) => {
  const { showWarning, timeLeft, stayLoggedIn, handleLogout } = useSessionTimeout();

  return (
    <>
      {children}
      <SessionTimeoutWarning
        isOpen={showWarning}
        timeLeft={timeLeft}
        onStayLoggedIn={stayLoggedIn}
        onLogout={handleLogout}
      />
    </>
  );
};