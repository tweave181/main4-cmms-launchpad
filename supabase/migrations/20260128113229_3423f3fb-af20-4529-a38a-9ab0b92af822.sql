-- Create customers table for work request submitters
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  phone_extension text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  job_title_id uuid REFERENCES public.job_titles(id) ON DELETE SET NULL,
  work_area_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  reports_to uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  password_hash text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create unique constraint on name within tenant
CREATE UNIQUE INDEX customers_tenant_name_unique ON public.customers(tenant_id, lower(name));

-- Add customer_id column to work_requests for customer submissions
ALTER TABLE public.work_requests 
ADD COLUMN customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL;

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customers table

-- Customers can view their own record
CREATE POLICY "Customers can view own record"
ON public.customers
FOR SELECT
USING (id = current_setting('app.customer_id', true)::uuid);

-- Admins can view all customers in their tenant
CREATE POLICY "Admins can view customers in their tenant"
ON public.customers
FOR SELECT
USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

-- Admins can create customers in their tenant
CREATE POLICY "Admins can create customers in their tenant"
ON public.customers
FOR INSERT
WITH CHECK (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

-- Admins can update customers in their tenant
CREATE POLICY "Admins can update customers in their tenant"
ON public.customers
FOR UPDATE
USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

-- Admins can delete customers in their tenant
CREATE POLICY "Admins can delete customers in their tenant"
ON public.customers
FOR DELETE
USING (tenant_id = get_current_user_tenant_id() AND is_current_user_admin());

-- Update work_requests RLS to allow customer submissions
-- Allow customers to view their own requests
CREATE POLICY "Customers can view own requests"
ON public.work_requests
FOR SELECT
USING (customer_id = current_setting('app.customer_id', true)::uuid);

-- Allow customers to create requests
CREATE POLICY "Customers can create requests"
ON public.work_requests
FOR INSERT
WITH CHECK (customer_id = current_setting('app.customer_id', true)::uuid);

-- Create trigger to update updated_at on customers
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();