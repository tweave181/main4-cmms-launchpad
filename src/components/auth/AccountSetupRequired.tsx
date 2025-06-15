
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/auth';
import { AlertCircle, LogOut, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface AccountSetupRequiredProps {
  reason: 'missing' | 'error';
  errorMessage?: string;
  onRetry?: () => void;
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true);
      try {
        await onRetry();
      } finally {
        setIsRetrying(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle>Account Setup Required</CardTitle>
            <CardDescription>
              {reason === 'missing' 
                ? "Your account is not fully configured" 
                : "There was an issue accessing your account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reason === 'missing' ? (
              <Alert>
                <AlertDescription>
                  Your account is not fully configured. Please contact an admin to complete your account setup, 
                  or if you were recently invited to join an organization, please ensure you accepted the invitation properly.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>
                  {errorMessage || "There was an error accessing your profile. Please try again or contact support."}
                </AlertDescription>
              </Alert>
            )}

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
              <div className="text-center text-sm text-muted-foreground">
                Signed in as: {user.email}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountSetupRequired;
