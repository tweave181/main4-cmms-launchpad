-- Create app_role enum with system_admin privilege
CREATE TYPE public.app_role AS ENUM ('system_admin', 'admin', 'manager', 'technician', 'contractor');

-- Create user_roles table for advanced role management
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.users(id),
    UNIQUE (user_id, role)
);

-- Enable Row Level Security
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create helper function to check if current user has system admin role
CREATE OR REPLACE FUNCTION public.is_system_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(auth.uid(), 'system_admin')
$$;

-- RLS policies for user_roles table
CREATE POLICY "System admins can view all user roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'system_admin'));

CREATE POLICY "System admins can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'system_admin'))
WITH CHECK (public.has_role(auth.uid(), 'system_admin'));

CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Update address audit log RLS policies to restrict to system admins only
DROP POLICY IF EXISTS "Admin users can view address audit logs in their tenant" ON public.address_audit_log;

CREATE POLICY "System admins can view address audit logs in their tenant" 
ON public.address_audit_log 
FOR SELECT 
USING (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()) AND
  public.has_role(auth.uid(), 'system_admin')
);

-- Keep the insert policy unchanged for automatic logging
-- CREATE POLICY "Users can insert address audit logs in their tenant" already exists and works fine

-- Create index for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);