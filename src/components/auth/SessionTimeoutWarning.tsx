import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';

interface SessionTimeoutWarningProps {
  isOpen: boolean;
  timeLeft: number; // in seconds
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export const SessionTimeoutWarning: React.FC<SessionTimeoutWarningProps> = ({
  isOpen,
  timeLeft,
  onStayLoggedIn,
  onLogout,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Session Timeout Warning
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Your session will expire in{' '}
            <span className="font-mono font-semibold text-amber-600">
              {formatTime(timeLeft)}
            </span>
            {' '}due to inactivity.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onLogout}
            className="sm:w-auto"
          >
            Logout Now
          </Button>
          <AlertDialogAction
            onClick={onStayLoggedIn}
            className="sm:w-auto"
          >
            Stay Logged In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};