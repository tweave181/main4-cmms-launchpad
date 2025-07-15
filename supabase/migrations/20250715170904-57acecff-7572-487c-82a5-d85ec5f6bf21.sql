-- Add reminder_days_before column to service_contracts
ALTER TABLE public.service_contracts ADD COLUMN reminder_days_before integer;

-- Create contract_asset_associations table
CREATE TABLE public.contract_asset_associations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES public.service_contracts(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(contract_id, asset_id)
);

-- Enable RLS on contract_asset_associations
ALTER TABLE public.contract_asset_associations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contract_asset_associations
CREATE POLICY "Users can view contract-asset associations in their tenant"
ON public.contract_asset_associations
FOR SELECT
USING (contract_id IN (
  SELECT id FROM public.service_contracts 
  WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
));

CREATE POLICY "Users can create contract-asset associations in their tenant"
ON public.contract_asset_associations
FOR INSERT
WITH CHECK (contract_id IN (
  SELECT id FROM public.service_contracts 
  WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
));

CREATE POLICY "Users can update contract-asset associations in their tenant"
ON public.contract_asset_associations
FOR UPDATE
USING (contract_id IN (
  SELECT id FROM public.service_contracts 
  WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
));

CREATE POLICY "Users can delete contract-asset associations in their tenant"
ON public.contract_asset_associations
FOR DELETE
USING (contract_id IN (
  SELECT id FROM public.service_contracts 
  WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
));

-- Create contract_reminders table for logging reminders
CREATE TABLE public.contract_reminders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id uuid NOT NULL REFERENCES public.service_contracts(id) ON DELETE CASCADE,
  reminder_date date NOT NULL,
  delivered boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(contract_id, reminder_date)
);

-- Enable RLS on contract_reminders
ALTER TABLE public.contract_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contract_reminders
CREATE POLICY "Users can view contract reminders in their tenant"
ON public.contract_reminders
FOR SELECT
USING (contract_id IN (
  SELECT id FROM public.service_contracts 
  WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
));

CREATE POLICY "Users can create contract reminders in their tenant"
ON public.contract_reminders
FOR INSERT
WITH CHECK (contract_id IN (
  SELECT id FROM public.service_contracts 
  WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
));

CREATE POLICY "Users can update contract reminders in their tenant"
ON public.contract_reminders
FOR UPDATE
USING (contract_id IN (
  SELECT id FROM public.service_contracts 
  WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
));

-- Create function to check for contract reminders
CREATE OR REPLACE FUNCTION public.check_contract_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert reminders for contracts that need them
  INSERT INTO public.contract_reminders (contract_id, reminder_date)
  SELECT 
    sc.id,
    CURRENT_DATE
  FROM public.service_contracts sc
  WHERE sc.reminder_days_before IS NOT NULL
    AND sc.status = 'Active'
    AND CURRENT_DATE = (sc.end_date - INTERVAL '1 day' * sc.reminder_days_before)
    AND NOT EXISTS (
      SELECT 1 FROM public.contract_reminders cr 
      WHERE cr.contract_id = sc.id 
      AND cr.reminder_date = CURRENT_DATE
    );
END;
$$;