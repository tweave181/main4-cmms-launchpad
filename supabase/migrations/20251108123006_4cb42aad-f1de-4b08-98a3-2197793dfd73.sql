-- Add trigger to automatically update inventory when parts are used in work orders
CREATE OR REPLACE FUNCTION public.update_inventory_on_part_usage()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Decrease inventory when part is added to work order
    UPDATE public.inventory_parts
    SET 
      quantity_in_stock = quantity_in_stock - NEW.quantity_used,
      updated_at = now()
    WHERE id = NEW.part_id;
    
    -- Check if stock went below zero
    IF (SELECT quantity_in_stock FROM public.inventory_parts WHERE id = NEW.part_id) < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for part. Current stock would be negative.';
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Adjust inventory based on quantity change
    UPDATE public.inventory_parts
    SET 
      quantity_in_stock = quantity_in_stock + OLD.quantity_used - NEW.quantity_used,
      updated_at = now()
    WHERE id = NEW.part_id;
    
    -- Check if stock went below zero
    IF (SELECT quantity_in_stock FROM public.inventory_parts WHERE id = NEW.part_id) < 0 THEN
      RAISE EXCEPTION 'Insufficient stock for part. Current stock would be negative.';
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Return parts to inventory when usage is deleted
    UPDATE public.inventory_parts
    SET 
      quantity_in_stock = quantity_in_stock + OLD.quantity_used,
      updated_at = now()
    WHERE id = OLD.part_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger on part_work_order_usage table
DROP TRIGGER IF EXISTS trigger_update_inventory_on_part_usage ON public.part_work_order_usage;

CREATE TRIGGER trigger_update_inventory_on_part_usage
AFTER INSERT OR UPDATE OR DELETE ON public.part_work_order_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_inventory_on_part_usage();

-- Add tenant_id to part_work_order_usage for better RLS
ALTER TABLE public.part_work_order_usage 
ADD COLUMN IF NOT EXISTS tenant_id UUID;

-- Update existing records to set tenant_id from work_orders
UPDATE public.part_work_order_usage pwo
SET tenant_id = wo.tenant_id
FROM public.work_orders wo
WHERE pwo.work_order_id = wo.id
AND pwo.tenant_id IS NULL;

-- Make tenant_id not null after populating
ALTER TABLE public.part_work_order_usage 
ALTER COLUMN tenant_id SET NOT NULL;

-- Update RLS policies for part_work_order_usage to use tenant_id
DROP POLICY IF EXISTS "Tenant-based access" ON public.part_work_order_usage;
DROP POLICY IF EXISTS "Users can create part usage for their tenant" ON public.part_work_order_usage;
DROP POLICY IF EXISTS "Users can view part usage for their tenant" ON public.part_work_order_usage;

CREATE POLICY "Users can view part usage in their tenant"
ON public.part_work_order_usage
FOR SELECT
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can create part usage in their tenant"
ON public.part_work_order_usage
FOR INSERT
WITH CHECK (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update part usage in their tenant"
ON public.part_work_order_usage
FOR UPDATE
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can delete part usage in their tenant"
ON public.part_work_order_usage
FOR DELETE
USING (tenant_id = get_current_user_tenant_id());