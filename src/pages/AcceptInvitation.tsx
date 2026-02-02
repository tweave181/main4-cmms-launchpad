import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InvitationData {
  id: string;
  name: string;
  email: string;
  role: string;
  tenant_id: string;
  tenant_name?: string;
}

const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'loading' | 'valid' | 'error' | 'creating' | 'success'>('loading');
  const [message, setMessage] = useState('');
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  
  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid invitation link. No token provided.');
        return;
      }

      try {
        // Fetch the invitation details
        const { data: invitationData, error: invitationError } = await supabase
          .from('user_invitations')
          .select(`
            id,
            name,
            email,
            role,
            tenant_id,
            accepted_at,
            expires_at,
            tenants!inner(name)
          `)
          .eq('token', token)
          .single();

        if (invitationError || !invitationData) {
          setStatus('error');
          setMessage('Invalid or expired invitation link.');
          return;
        }

        // Check if invitation has already been accepted
        if (invitationData.accepted_at) {
          setStatus('error');
          setMessage('This invitation has already been used.');
          return;
        }

        // Check if invitation has expired
        if (new Date(invitationData.expires_at) < new Date()) {
          setStatus('error');
          setMessage('This invitation has expired. Please request a new one.');
          return;
        }

        setInvitation({
          id: invitationData.id,
          name: invitationData.name || '',
          email: invitationData.email,
          role: invitationData.role,
          tenant_id: invitationData.tenant_id,
          tenant_name: (invitationData.tenants as any)?.name || 'your organization',
        });
        setStatus('valid');
      } catch (err: any) {
        console.error('Error validating invitation:', err);
        setStatus('error');
        setMessage(err.message || 'An unexpected error occurred.');
      }
    };

    validateToken();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invitation) return;

    // Validate passwords
    if (password.length < 6) {
      toast({
        title: 'Password too short',
        description: 'Password must be at least 6 characters.',
        variant: 'destructive',
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please ensure both passwords match.',
        variant: 'destructive',
      });
      return;
    }

    setStatus('creating');

    try {
      const token = searchParams.get('token');
      
      // Create the user account via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: invitation.name,
            tenant_id: invitation.tenant_id,
            role: invitation.role,
            invitation_token: token,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      // Mark the invitation as accepted by setting accepted_at
      const { error: updateError } = await supabase
        .from('user_invitations')
        .update({ accepted_at: new Date().toISOString() })
        .eq('id', invitation.id);

      if (updateError) {
        console.error('Error updating invitation status:', updateError);
        // Don't throw - user was created successfully
      }

      setStatus('success');
      setMessage('Your account has been created successfully!');

      // Auto-login should have happened, redirect after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err: any) {
      console.error('Error creating account:', err);
      setStatus('valid'); // Allow retry
      toast({
        title: 'Account creation failed',
        description: err.message || 'Failed to create your account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
              <CardTitle>Validating Invitation</CardTitle>
              <CardDescription>Please wait while we verify your invitation...</CardDescription>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Invitation Invalid</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-primary">Account Created!</CardTitle>
              <CardDescription>{message}</CardDescription>
              <CardDescription className="mt-2">Redirecting you to the dashboard...</CardDescription>
            </>
          )}

          {(status === 'valid' || status === 'creating') && invitation && (
            <>
              <CardTitle>Welcome, {invitation.name || 'there'}!</CardTitle>
              <CardDescription>
                You've been invited to join <strong>{invitation.tenant_name}</strong> as a <strong>{invitation.role}</strong>.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {status === 'error' && (
            <Button
              onClick={() => navigate('/auth')}
              className="w-full"
            >
              Go to Sign In
            </Button>
          )}

          {(status === 'valid' || status === 'creating') && invitation && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={invitation.email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={invitation.name}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                    minLength={6}
                    disabled={status === 'creating'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                    minLength={6}
                    disabled={status === 'creating'}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={status === 'creating'}
              >
                {status === 'creating' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
