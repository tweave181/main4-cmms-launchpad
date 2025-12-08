import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import { handleError } from '@/utils/errorHandling';
import InvitationCodeInput from './InvitationCodeInput';
import BusinessTypeSelect from './BusinessTypeSelect';

interface RegisterFormProps {
  onToggleMode: () => void;
  onRegistrationComplete: (email: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode, onRegistrationComplete }) => {
  const [formData, setFormData] = useState({
    invitationCode: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    tenantName: '',
    tenantSlug: '',
    businessType: '',
  });
  const [isInvitationValid, setIsInvitationValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from tenant name
    if (name === 'tenantName') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        tenantSlug: slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { invitationCode, name, email, password, confirmPassword, tenantName, tenantSlug, businessType } = formData;

    if (!isInvitationValid) {
      toast({
        title: "Error",
        description: "Please enter a valid invitation code",
        variant: "destructive",
      });
      return;
    }

    if (!name || !email || !password || !tenantName || !tenantSlug || !businessType) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name, tenantName, tenantSlug, businessType, invitationCode);
      onRegistrationComplete(email);
    } catch (error) {
      handleError(error, 'Registration', {
        showToast: true,
        toastTitle: 'Registration Failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Sign up to create your organization and account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InvitationCodeInput
            value={formData.invitationCode}
            onChange={(value) => setFormData(prev => ({ ...prev, invitationCode: value }))}
            onValidationChange={setIsInvitationValid}
          />
          
          <div className="pt-2 border-t">
            <BusinessTypeSelect
              value={formData.businessType}
              onChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tenantName">Organization Name</Label>
            <Input
              id="tenantName"
              name="tenantName"
              placeholder="Your organization name"
              value={formData.tenantName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenantSlug">Organization Slug</Label>
            <Input
              id="tenantSlug"
              name="tenantSlug"
              placeholder="organization-slug"
              value={formData.tenantSlug}
              onChange={handleInputChange}
              pattern="^[a-z0-9-]+$"
              title="Only lowercase letters, numbers, and hyphens allowed"
              required
            />
          </div>
          
          <div className="pt-2 border-t space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading || !isInvitationValid}>
            {loading ? "Creating account..." : "Create Account"}
          </Button>
          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onToggleMode}
              className="text-sm"
            >
              Already have an account? Sign in
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
