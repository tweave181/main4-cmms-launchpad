-- Create email_templates table for customizable email templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL, -- 'contract_reminder', 'user_invitation', 'password_reset', 'welcome', 'maintenance'
  template_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  variables JSONB DEFAULT '[]'::jsonb, -- Array of available variables like {{contract_title}}
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, template_type, is_default)
);

-- Create notification_settings table for global and user notification preferences
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL for global settings
  setting_type TEXT NOT NULL, -- 'global', 'user'
  contract_reminders_enabled BOOLEAN DEFAULT true,
  contract_reminder_days INTEGER[] DEFAULT ARRAY[7, 14, 30], -- Days before expiry
  toast_notifications_enabled BOOLEAN DEFAULT true,
  toast_duration INTEGER DEFAULT 5000, -- milliseconds
  toast_position TEXT DEFAULT 'bottom-right',
  system_notifications_enabled BOOLEAN DEFAULT true,
  maintenance_notifications_enabled BOOLEAN DEFAULT true,
  security_alerts_enabled BOOLEAN DEFAULT true,
  email_frequency TEXT DEFAULT 'immediate', -- 'immediate', 'daily_digest', 'weekly_digest'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Create email_delivery_log table for tracking email delivery
CREATE TABLE IF NOT EXISTS public.email_delivery_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.email_templates(id) ON DELETE SET NULL,
  recipient_email TEXT NOT NULL,
  recipient_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  delivery_status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
  provider_response JSONB,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add email configuration fields to program_settings
ALTER TABLE public.program_settings 
ADD COLUMN IF NOT EXISTS email_provider TEXT DEFAULT 'resend', -- 'resend', 'sendgrid', 'smtp'
ADD COLUMN IF NOT EXISTS email_from_name TEXT DEFAULT 'System',
ADD COLUMN IF NOT EXISTS email_from_address TEXT,
ADD COLUMN IF NOT EXISTS smtp_host TEXT,
ADD COLUMN IF NOT EXISTS smtp_port INTEGER DEFAULT 587,
ADD COLUMN IF NOT EXISTS smtp_secure BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS smtp_username TEXT,
ADD COLUMN IF NOT EXISTS email_signature TEXT;

-- Add delivery status tracking to contract_reminders_log
ALTER TABLE public.contract_reminders_log
ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS email_delivery_log_id UUID REFERENCES public.email_delivery_log(id) ON DELETE SET NULL;

-- Enable RLS on new tables
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_delivery_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "Admins can manage email templates in their tenant"
  ON public.email_templates
  FOR ALL
  USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin())
  WITH CHECK (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "Users can view email templates in their tenant"
  ON public.email_templates
  FOR SELECT
  USING (tenant_id = get_current_user_tenant_id());

-- RLS Policies for notification_settings
CREATE POLICY "Admins can manage global notification settings"
  ON public.notification_settings
  FOR ALL
  USING (
    tenant_id = get_current_user_tenant_id() 
    AND (is_current_user_admin() OR user_id = auth.uid())
  )
  WITH CHECK (
    tenant_id = get_current_user_tenant_id() 
    AND (is_current_user_admin() OR user_id = auth.uid())
  );

CREATE POLICY "Users can view notification settings in their tenant"
  ON public.notification_settings
  FOR SELECT
  USING (tenant_id = get_current_user_tenant_id());

-- RLS Policies for email_delivery_log
CREATE POLICY "Admins can view email delivery logs in their tenant"
  ON public.email_delivery_log
  FOR SELECT
  USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

CREATE POLICY "System can insert email delivery logs"
  ON public.email_delivery_log
  FOR INSERT
  WITH CHECK (tenant_id = get_current_user_tenant_id());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_tenant_type ON public.email_templates(tenant_id, template_type);
CREATE INDEX IF NOT EXISTS idx_notification_settings_tenant_user ON public.notification_settings(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_tenant_status ON public.email_delivery_log(tenant_id, delivery_status);
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_recipient ON public.email_delivery_log(recipient_email);

-- Create trigger for updated_at
CREATE TRIGGER update_email_templates_updated_at
  BEFORE UPDATE ON public.email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default email templates
INSERT INTO public.email_templates (tenant_id, template_type, template_name, subject, body_html, body_text, is_default, variables)
SELECT 
  t.id,
  'contract_reminder',
  'Contract Expiry Reminder',
  'Contract Expiring Soon: {{contract_title}}',
  '<h1>Contract Expiry Reminder</h1><p>Dear {{user_name}},</p><p>This is a reminder that the following contract is expiring soon:</p><ul><li><strong>Contract:</strong> {{contract_title}}</li><li><strong>Vendor:</strong> {{vendor_name}}</li><li><strong>Expiry Date:</strong> {{end_date}}</li><li><strong>Days Until Expiry:</strong> {{days_until_expiry}}</li></ul><p>Please review and take necessary action.</p><p>Best regards,<br>{{organization_name}}</p>',
  'Contract Expiry Reminder\n\nDear {{user_name}},\n\nThis is a reminder that the following contract is expiring soon:\n\nContract: {{contract_title}}\nVendor: {{vendor_name}}\nExpiry Date: {{end_date}}\nDays Until Expiry: {{days_until_expiry}}\n\nPlease review and take necessary action.\n\nBest regards,\n{{organization_name}}',
  true,
  '["contract_title", "vendor_name", "end_date", "days_until_expiry", "user_name", "organization_name"]'::jsonb
FROM public.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM public.email_templates 
  WHERE tenant_id = t.id AND template_type = 'contract_reminder' AND is_default = true
);

-- Insert default global notification settings for each tenant
INSERT INTO public.notification_settings (tenant_id, user_id, setting_type)
SELECT t.id, NULL, 'global'
FROM public.tenants t
WHERE NOT EXISTS (
  SELECT 1 FROM public.notification_settings 
  WHERE tenant_id = t.id AND user_id IS NULL
);