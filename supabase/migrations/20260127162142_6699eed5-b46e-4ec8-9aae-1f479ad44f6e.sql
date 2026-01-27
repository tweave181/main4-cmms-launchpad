-- Create helper function to check if user is admin or manager
CREATE OR REPLACE FUNCTION public.is_current_user_admin_or_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role IN ('admin', 'manager') FROM public.users WHERE id = auth.uid() LIMIT 1), 
    false
  );
$$;

-- Create work_request_categories table
CREATE TABLE public.work_request_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on work_request_categories
ALTER TABLE public.work_request_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for work_request_categories
CREATE POLICY "Users can view categories in their tenant"
ON public.work_request_categories FOR SELECT
USING (tenant_id = public.get_current_user_tenant_id());

CREATE POLICY "Admins can manage categories"
ON public.work_request_categories FOR ALL
USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin());

-- Create work_requests table
CREATE TABLE public.work_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  request_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  location_description TEXT,
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on work_requests
ALTER TABLE public.work_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for work_requests

-- Users can view their own requests
CREATE POLICY "Users can view own requests"
ON public.work_requests FOR SELECT
USING (tenant_id = public.get_current_user_tenant_id() AND submitted_by = auth.uid());

-- Admins/Managers can view all requests in tenant
CREATE POLICY "Staff can view all tenant requests"
ON public.work_requests FOR SELECT
USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin_or_manager());

-- Users can create requests in their tenant
CREATE POLICY "Users can submit requests"
ON public.work_requests FOR INSERT
WITH CHECK (tenant_id = public.get_current_user_tenant_id() AND submitted_by = auth.uid());

-- Only staff can update requests
CREATE POLICY "Staff can update requests"
ON public.work_requests FOR UPDATE
USING (tenant_id = public.get_current_user_tenant_id() AND public.is_current_user_admin_or_manager());

-- Create function to generate request number
CREATE OR REPLACE FUNCTION public.generate_work_request_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
  request_number TEXT;
  latest_request_number TEXT;
BEGIN
  -- Get the latest request number globally
  SELECT wr.request_number INTO latest_request_number
  FROM public.work_requests wr
  WHERE wr.request_number ~ '^REQ-[0-9]+$'
  ORDER BY CAST(SUBSTRING(wr.request_number FROM 5) AS INTEGER) DESC
  LIMIT 1;
  
  IF latest_request_number IS NOT NULL THEN
    next_number := CAST(SUBSTRING(latest_request_number FROM 5) AS INTEGER) + 1;
  ELSE
    next_number := 1;
  END IF;
  
  request_number := 'REQ-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN request_number;
END;
$$;

-- Create trigger to auto-set request number
CREATE OR REPLACE FUNCTION public.set_work_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.request_number IS NULL OR NEW.request_number = '' THEN
    NEW.request_number := public.generate_work_request_number();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_work_request_number
BEFORE INSERT ON public.work_requests
FOR EACH ROW
EXECUTE FUNCTION public.set_work_request_number();

-- Create trigger for updated_at
CREATE TRIGGER update_work_requests_updated_at
BEFORE UPDATE ON public.work_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_work_requests_tenant_id ON public.work_requests(tenant_id);
CREATE INDEX idx_work_requests_status ON public.work_requests(status);
CREATE INDEX idx_work_requests_submitted_by ON public.work_requests(submitted_by);
CREATE INDEX idx_work_request_categories_tenant_id ON public.work_request_categories(tenant_id);

-- Seed default categories for existing tenants
INSERT INTO public.work_request_categories (tenant_id, name, description, icon, sort_order)
SELECT 
  t.id,
  category.name,
  category.description,
  category.icon,
  category.sort_order
FROM public.tenants t
CROSS JOIN (
  VALUES 
    ('Equipment Breakdown', 'Machinery, lifts, doors, electrical equipment failures', 'wrench', 1),
    ('Environmental Issues', 'Heating, cooling, ventilation, lighting problems', 'thermometer', 2),
    ('Plumbing / Water', 'Blocked toilets, leaks, drainage issues', 'droplet', 3),
    ('Safety Hazard', 'Trip hazards, damaged fixtures, urgent safety concerns', 'alert-triangle', 4),
    ('Cleaning', 'Spillage, mess, cleaning required', 'sparkles', 5),
    ('General Maintenance', 'Other maintenance requests', 'hammer', 6),
    ('Other', 'Requests that dont fit other categories', 'help-circle', 7)
) AS category(name, description, icon, sort_order);