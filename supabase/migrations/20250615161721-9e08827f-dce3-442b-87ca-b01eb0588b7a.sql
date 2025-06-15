
-- Enable RLS and standardize policies for assets table
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.assets;

CREATE POLICY "Tenant-based access"
  ON public.assets
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Enable RLS and standardize policies for inventory_parts
ALTER TABLE public.inventory_parts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.inventory_parts;

CREATE POLICY "Tenant-based access"
  ON public.inventory_parts
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Enable RLS and standardize policies for work_orders
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.work_orders;

CREATE POLICY "Tenant-based access"
  ON public.work_orders
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Enable RLS and standardize policies for departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.departments;

CREATE POLICY "Tenant-based access"
  ON public.departments
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Enable RLS and standardize policies for preventive_maintenance_schedules
ALTER TABLE public.preventive_maintenance_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.preventive_maintenance_schedules;

CREATE POLICY "Tenant-based access"
  ON public.preventive_maintenance_schedules
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Enable RLS and standardize policies for tenants (organization info)
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.tenants;

CREATE POLICY "Tenant-based access"
  ON public.tenants
  USING (
    id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Enable RLS for users table (profile)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profile access" ON public.users;

CREATE POLICY "Profile access"
  ON public.users
  USING (
    id = auth.uid()
  );

-- Enable RLS for part_asset_associations
ALTER TABLE public.part_asset_associations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.part_asset_associations;

CREATE POLICY "Tenant-based access"
  ON public.part_asset_associations
  USING (
    asset_id IN (
      SELECT id FROM public.assets WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    )
  );

-- Enable RLS for part_work_order_usage
ALTER TABLE public.part_work_order_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.part_work_order_usage;

CREATE POLICY "Tenant-based access"
  ON public.part_work_order_usage
  USING (
    work_order_id IN (
      SELECT id FROM public.work_orders WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    )
  );

-- Enable RLS for stock_transactions
ALTER TABLE public.stock_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.stock_transactions;

CREATE POLICY "Tenant-based access"
  ON public.stock_transactions
  USING (
    part_id IN (
      SELECT id FROM public.inventory_parts WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    )
  );

-- Enable RLS for pm_schedule_assets
ALTER TABLE public.pm_schedule_assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.pm_schedule_assets;

CREATE POLICY "Tenant-based access"
  ON public.pm_schedule_assets
  USING (
    pm_schedule_id IN (
      SELECT id FROM public.preventive_maintenance_schedules WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    )
  );

-- Enable RLS for pm_schedule_checklist_items
ALTER TABLE public.pm_schedule_checklist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.pm_schedule_checklist_items;

CREATE POLICY "Tenant-based access"
  ON public.pm_schedule_checklist_items
  USING (
    pm_schedule_id IN (
      SELECT id FROM public.preventive_maintenance_schedules WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    )
  );

-- Enable RLS for work_order_comments
ALTER TABLE public.work_order_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.work_order_comments;

CREATE POLICY "Tenant-based access"
  ON public.work_order_comments
  USING (
    work_order_id IN (
      SELECT id FROM public.work_orders WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
    )
  );

-- Enable RLS for user_invitations (admin invites)
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tenant-based access" ON public.user_invitations;

CREATE POLICY "Tenant-based access"
  ON public.user_invitations
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );
