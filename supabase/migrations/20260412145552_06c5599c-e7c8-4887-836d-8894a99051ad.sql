
-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Tenant select frequency_types" ON public.frequency_types;
DROP POLICY IF EXISTS "Tenant insert frequency_types" ON public.frequency_types;
DROP POLICY IF EXISTS "Tenant update frequency_types" ON public.frequency_types;
DROP POLICY IF EXISTS "Tenant delete frequency_types" ON public.frequency_types;

-- Allow all authenticated users to view frequency types (including global ones with NULL tenant_id)
CREATE POLICY "Authenticated users can view frequency_types"
ON public.frequency_types FOR SELECT TO authenticated
USING (tenant_id IS NULL OR tenant_id = get_current_user_tenant_id());

-- Only admins can create frequency types
CREATE POLICY "Admins can insert frequency_types"
ON public.frequency_types FOR INSERT TO authenticated
WITH CHECK (is_current_user_admin());

-- Only admins can update frequency types
CREATE POLICY "Admins can update frequency_types"
ON public.frequency_types FOR UPDATE TO authenticated
USING (is_current_user_admin());

-- Only admins can delete frequency types
CREATE POLICY "Admins can delete frequency_types"
ON public.frequency_types FOR DELETE TO authenticated
USING (is_current_user_admin());
