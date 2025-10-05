import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useForm } from 'react-hook-form';
import { Mail, TestTube, HelpCircle, Loader2 } from 'lucide-react';
import { useProgramSettings, useUpdateProgramSettings } from '@/hooks/useProgramSettings';
import { toast } from 'sonner';

interface EmailConfigFormData {
  email_provider: string;
  email_from_name: string;
  email_from_address: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_secure?: boolean;
  smtp_username?: string;
  email_signature?: string;
}

export const EmailConfigurationSection: React.FC = () => {
  const { data: settings, isLoading } = useProgramSettings();
  const updateSettings = useUpdateProgramSettings();

  const { register, handleSubmit, watch, setValue } = useForm<EmailConfigFormData>({
    defaultValues: {
      email_provider: settings?.email_provider || 'resend',
      email_from_name: settings?.email_from_name || 'System',
      email_from_address: settings?.email_from_address || '',
      smtp_host: settings?.smtp_host || '',
      smtp_port: settings?.smtp_port || 587,
      smtp_secure: settings?.smtp_secure !== false,
      smtp_username: settings?.smtp_username || '',
      email_signature: settings?.email_signature || '',
    },
  });

  React.useEffect(() => {
    if (settings) {
      setValue('email_provider', settings.email_provider || 'resend');
      setValue('email_from_name', settings.email_from_name || 'System');
      setValue('email_from_address', settings.email_from_address || '');
      setValue('smtp_host', settings.smtp_host || '');
      setValue('smtp_port', settings.smtp_port || 587);
      setValue('smtp_secure', settings.smtp_secure !== false);
      setValue('smtp_username', settings.smtp_username || '');
      setValue('email_signature', settings.email_signature || '');
    }
  }, [settings, setValue]);

  const emailProvider = watch('email_provider');

  const onSubmit = (data: EmailConfigFormData) => {
    if (!settings?.id) return;
    updateSettings.mutate({ 
      id: settings.id, 
      data 
    }, {
      onSuccess: () => {
        toast.success('Email configuration saved successfully');
      },
      onError: () => {
        toast.error('Failed to save email configuration');
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          <CardTitle>Email Configuration</CardTitle>
        </div>
        <CardDescription>
          Configure your email service provider and sender information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="email_provider" className="flex items-center gap-2">
                  Email Service Provider
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Choose your email service provider. You'll need to set up an account and configure API keys in Supabase secrets (RESEND_API_KEY or SENDGRID_API_KEY).</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Select
                  value={emailProvider}
                  onValueChange={(value) => setValue('email_provider', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="resend">Resend</SelectItem>
                    <SelectItem value="sendgrid">SendGrid</SelectItem>
                    <SelectItem value="smtp">Custom SMTP</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email_from_name" className="flex items-center gap-2">
                    From Name
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The display name that appears as the sender in recipients' inboxes (e.g., "MyCompany Maintenance" or "Facilities Team").</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="email_from_name"
                    {...register('email_from_name')}
                    placeholder="MyCompany Maintenance"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email_from_address" className="flex items-center gap-2">
                    From Email Address
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p>The email address emails will be sent from. Must use a verified domain with your email provider (e.g., noreply@yourcompany.com).</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id="email_from_address"
                    type="email"
                    {...register('email_from_address')}
                    placeholder="noreply@yourcompany.com"
                  />
                </div>
              </div>

              {emailProvider === 'smtp' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="smtp_host" className="flex items-center gap-2">
                        SMTP Host
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>The SMTP server hostname (e.g., smtp.gmail.com or mail.yourcompany.com).</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="smtp_host"
                        {...register('smtp_host')}
                        placeholder="smtp.example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="smtp_port" className="flex items-center gap-2">
                        SMTP Port
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>The SMTP port number. Common ports: 587 (TLS), 465 (SSL), or 25 (unencrypted).</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="smtp_port"
                        type="number"
                        {...register('smtp_port', { valueAsNumber: true })}
                        placeholder="587"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smtp_username" className="flex items-center gap-2">
                      SMTP Username
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>Your SMTP authentication username. Store the password securely in Supabase secrets as SMTP_PASSWORD.</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="smtp_username"
                      {...register('smtp_username')}
                      placeholder="username@example.com"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email_signature" className="flex items-center gap-2">
                  Email Signature
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The closing text that appears at the end of all emails (e.g., "Best regards, The Maintenance Team").</p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Textarea
                  id="email_signature"
                  {...register('email_signature')}
                  placeholder="Best regards,&#10;The Maintenance Team"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={updateSettings.isPending}>
                {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Configuration
              </Button>
              <Button type="button" variant="outline">
                <TestTube className="mr-2 h-4 w-4" />
                Test Connection
              </Button>
            </div>
          </form>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
};
