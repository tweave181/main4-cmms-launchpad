
-- Create work_orders table
CREATE TABLE public.work_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  title TEXT NOT NULL,
  description TEXT,
  asset_id UUID REFERENCES public.assets(id),
  assigned_to UUID REFERENCES public.users(id),
  created_by UUID REFERENCES public.users(id),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  work_type TEXT NOT NULL DEFAULT 'corrective' CHECK (work_type IN ('corrective', 'preventive', 'emergency', 'inspection')),
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for work_orders
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

-- Policy for selecting work orders (users can see work orders in their tenant)
CREATE POLICY "Users can view work orders in their tenant" 
  ON public.work_orders 
  FOR SELECT 
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy for inserting work orders (users can create work orders in their tenant)
CREATE POLICY "Users can create work orders in their tenant" 
  ON public.work_orders 
  FOR INSERT 
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy for updating work orders (users can update work orders in their tenant)
CREATE POLICY "Users can update work orders in their tenant" 
  ON public.work_orders 
  FOR UPDATE 
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Policy for deleting work orders (only admins can delete work orders in their tenant)
CREATE POLICY "Admins can delete work orders in their tenant" 
  ON public.work_orders 
  FOR DELETE 
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_work_orders_updated_at 
  BEFORE UPDATE ON public.work_orders
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create work_order_comments table for activity tracking
CREATE TABLE public.work_order_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id),
  comment TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'comment' CHECK (comment_type IN ('comment', 'status_change', 'assignment', 'time_log')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for work_order_comments
ALTER TABLE public.work_order_comments ENABLE ROW LEVEL SECURITY;

-- Policy for viewing comments (users can see comments for work orders in their tenant)
CREATE POLICY "Users can view comments for work orders in their tenant" 
  ON public.work_order_comments 
  FOR SELECT 
  USING (
    work_order_id IN (
      SELECT id FROM public.work_orders 
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.users WHERE id = auth.uid()
      )
    )
  );

-- Policy for creating comments (users can create comments for work orders in their tenant)
CREATE POLICY "Users can create comments for work orders in their tenant" 
  ON public.work_order_comments 
  FOR INSERT 
  WITH CHECK (
    work_order_id IN (
      SELECT id FROM public.work_orders 
      WHERE tenant_id IN (
        SELECT tenant_id FROM public.users WHERE id = auth.uid()
      )
    ) AND user_id = auth.uid()
  );
