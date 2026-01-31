import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Lock, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import CustomerSignupForm from '@/components/customers/CustomerSignupForm';

interface TenantInfo {
  id: string;
  name: string;
  subdomain: string;
}

const TenantPortal: React.FC = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTenant, setIsLoadingTenant] = useState(true);
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [tenantError, setTenantError] = useState<string | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  const { login, isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Extract subdomain from URL
  const getSubdomain = (): string | null => {
    const hostname = window.location.hostname;
    
    // Check for main4.uk subdomains
    if (hostname.endsWith('.main4.uk')) {
      const parts = hostname.split('.');
      if (parts.length >= 3) {
        return parts[0];
      }
    }
    
    // For development/preview, check for subdomain query param
    const params = new URLSearchParams(window.location.search);
    const subdomainParam = params.get('subdomain');
    if (subdomainParam) {
      return subdomainParam;
    }
    
    return null;
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/portal');
    }
  }, [isAuthenticated, navigate]);

  // Load tenant by subdomain
  useEffect(() => {
    const loadTenant = async () => {
      const subdomain = getSubdomain();
      
      if (!subdomain) {
        setTenantError('Invalid portal URL. Please use your organization\'s dedicated link.');
        setIsLoadingTenant(false);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('customer-auth', {
          body: { action: 'get_tenant_by_subdomain', subdomain },
        });

        if (error || !data?.success) {
          setTenantError('Organization not found. Please check your URL or contact support.');
          setIsLoadingTenant(false);
          return;
        }

        setTenant(data.tenant);
      } catch (err) {
        console.error('Failed to load tenant:', err);
        setTenantError('Failed to load organization. Please try again.');
      }
      
      setIsLoadingTenant(false);
    };

    loadTenant();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenant) return;

    if (!name.trim() || !password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const result = await login(name.trim(), password, tenant.id);

    if (result.success) {
      toast({
        title: 'Welcome!',
        description: 'You have successfully logged in.',
      });
      navigate('/portal');
    } else {
      toast({
        title: 'Login Failed',
        description: result.error || 'Invalid credentials. Please try again.',
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  // Loading state
  if (isLoadingTenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading portal...</p>
        </div>
      </div>
    );
  }

  // Error state - tenant not found
  if (tenantError || !tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">Portal Not Found</CardTitle>
            <CardDescription>{tenantError}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              If you believe this is an error, please contact your organization administrator.
            </p>
            <Button variant="outline" onClick={() => navigate('/')}>
              Go to Main Site
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show signup form if toggled
  if (showSignup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <CustomerSignupForm 
          tenantId={tenant.id}
          tenants={[{ id: tenant.id, name: tenant.name }]}
          isLoadingTenants={false}
          onTenantChange={() => {}} // No change allowed - tenant is fixed
          onBackToLogin={() => setShowSignup(false)}
          fixedTenant={true}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Landing Section */}
      <div className="text-center mb-8">
        <Building2 className="h-16 w-16 mx-auto text-primary mb-4" />
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Customer Portal
        </h1>
        <p className="text-muted-foreground">
          Submit and track your work requests
        </p>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access the portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <Button
              type="button"
              variant="link"
              onClick={() => setShowSignup(true)}
              className="w-full"
            >
              Don't have an account? Sign up
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground">
        Powered by Main4 CMMS
      </p>
    </div>
  );
};

export default TenantPortal;
