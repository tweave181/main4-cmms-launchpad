
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth';
import { AlertCircle, LogOut, RefreshCw, HelpCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { handleError } from '@/utils/errorHandling';

interface AccountSetupRequiredProps {
  reason: 'missing' | 'error';
  errorMessage?: string;
  onRetry?: () => Promise<void>;
}

const AccountSetupRequired: React.FC<AccountSetupRequiredProps> = ({ 
  reason, 
  errorMessage, 
  onRetry 
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const { signOut, user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
    } catch (error) {
      handleError(error, 'SignOut', {
        showToast: true,
        toastTitle: 'Sign Out Failed',
      });
    }
  };

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } catch (error) {
        handleError(error, 'RetryProfileLoad', {
          showToast: true,
          toastTitle: 'Retry Failed',
        });
      } finally {
        setIsRetrying(false);
      }
    }
  };

  const getTitle = () => {
    switch (reason) {
      case 'missing':
        return 'Account Setup Required';
      case 'error':
        return 'Profile Access Issue';
      default:
        return 'Account Setup Required';
    }
  };

  const getDescription = () => {
    switch (reason) {
      case 'missing':
        return 'Your account profile could not be found in our system';
      case 'error':
        return 'There was an issue accessing your account profile';
      default:
        return 'Your account needs additional configuration';
    }
  };

  const getAlertMessage = () => {
    switch (reason) {
      case 'missing':
        return 'Your account is not fully configured in our system. This usually happens when your account was created but the profile setup was not completed. Please contact an administrator to complete your account setup.';
      case 'error':
        return errorMessage || 'There was an error accessing your profile. This could be a temporary issue or a permissions problem. Please try again or contact support if the problem persists.';
      default:
        return 'There was an issue with your account setup. Please contact support for assistance.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              {reason === 'error' ? (
                <AlertCircle className="h-6 w-6 text-orange-600" />
              ) : (
                <HelpCircle className="h-6 w-6 text-orange-600" />
              )}
            </div>
            <CardTitle>{getTitle()}</CardTitle>
            <CardDescription>
              {getDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant={reason === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>
                {getAlertMessage()}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {reason === 'error' && onRetry && (
                <Button 
                  onClick={handleRetry} 
                  disabled={isRetrying}
                  className="w-full"
                  variant="default"
                >
                  {isRetrying ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </>
                  )}
                </Button>
              )}
              
              <Button 
                onClick={handleSignOut} 
                variant="outline" 
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>

            {user?.email && (
              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                Signed in as: {user.email}
              </div>
            )}

            <div className="text-center text-xs text-muted-foreground">
              If you continue to experience issues, please contact your system administrator for assistance.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountSetupRequired;
