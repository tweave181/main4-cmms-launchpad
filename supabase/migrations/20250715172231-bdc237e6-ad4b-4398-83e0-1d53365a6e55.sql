-- Add email_reminder_enabled flag to service_contracts table
ALTER TABLE public.service_contracts 
ADD COLUMN email_reminder_enabled boolean NOT NULL DEFAULT false;

-- Create contract reminders log table
CREATE TABLE public.contract_reminders_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES public.service_contracts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  delivery_method text NOT NULL CHECK (delivery_method IN ('toast', 'email')),
  reminder_date date NOT NULL DEFAULT CURRENT_DATE,
  delivered_at timestamp with time zone NOT NULL DEFAULT now(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on contract_reminders_log
ALTER TABLE public.contract_reminders_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for contract_reminders_log
CREATE POLICY "Users can view reminder logs in their tenant" ON public.contract_reminders_log
FOR SELECT USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can insert reminder logs in their tenant" ON public.contract_reminders_log
FOR INSERT WITH CHECK (tenant_id = get_current_user_tenant_id());

-- Create index for performance
CREATE INDEX idx_contract_reminders_log_contract_id ON public.contract_reminders_log(contract_id);
CREATE INDEX idx_contract_reminders_log_user_id ON public.contract_reminders_log(user_id);
CREATE INDEX idx_contract_reminders_log_reminder_date ON public.contract_reminders_log(reminder_date);