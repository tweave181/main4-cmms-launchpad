import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface EmailVerificationPendingProps {
  email: string;
  onBackToLogin: () => void;
}

const EmailVerificationPending: React.FC<EmailVerificationPendingProps> = ({
  email,
  onBackToLogin,
}) => {
  const [resending, setResending] = React.useState(false);

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      toast({
        title: 'Email Sent',
        description: 'A new verification email has been sent to your inbox.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resend verification email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          We've sent a verification link to <strong>{email}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
          <p className="mb-2">Please check your email and click the verification link to activate your account.</p>
          <p>If you don't see the email, check your spam folder.</p>
        </div>
        
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full"
          >
            {resending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Verification Email
              </>
            )}
          </Button>
          
          <Button
            variant="link"
            onClick={onBackToLogin}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailVerificationPending;
