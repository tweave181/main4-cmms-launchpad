import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Lock, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CustomerLogin: React.FC = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);

  const { login, isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/portal');
    }
  }, [isAuthenticated, navigate]);

  // Load tenants for selection
  useEffect(() => {
    const loadTenants = async () => {
      try {
        // Direct fetch to avoid type inference issues
        const response = await fetch(
          `https://mzpweuuvyuaawpttoqkn.supabase.co/rest/v1/tenants?select=id,name&is_active=eq.true&order=name`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cHdldXV2eXVhYXdwdHRvcWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMTM4ODUsImV4cCI6MjA2NDg4OTg4NX0.7EbVEOq7uoOTMp2DpD5IdXVLR1uK6FcqVp1o2aP9NC8',
            },
          }
        );
        const tenantData: { id: string; name: string }[] = await response.json();

        if (tenantData && Array.isArray(tenantData)) {
          setTenants(tenantData);
          if (tenantData.length === 1) {
            setTenantId(tenantData[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to load tenants:', err);
      }
      setIsLoadingTenants(false);
    };

    loadTenants();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !password || !tenantId) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    const result = await login(name.trim(), password, tenantId);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Customer Portal</CardTitle>
          <CardDescription>
            Sign in to submit work requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {tenants.length > 1 && (
              <div className="space-y-2">
                <Label htmlFor="tenant">Organization</Label>
                <Select value={tenantId} onValueChange={setTenantId} disabled={isLoadingTenants}>
                  <SelectTrigger>
                    <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

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
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerLogin;
