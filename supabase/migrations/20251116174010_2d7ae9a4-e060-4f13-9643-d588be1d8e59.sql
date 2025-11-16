-- Add last_alert_sent_at column to inventory_parts for duplicate prevention
ALTER TABLE public.inventory_parts 
ADD COLUMN IF NOT EXISTS last_alert_sent_at TIMESTAMP WITH TIME ZONE;

-- Add index for efficient querying of low stock parts
CREATE INDEX IF NOT EXISTS idx_inventory_parts_low_stock 
ON public.inventory_parts(tenant_id, quantity_in_stock, reorder_threshold) 
WHERE quantity_in_stock <= reorder_threshold;