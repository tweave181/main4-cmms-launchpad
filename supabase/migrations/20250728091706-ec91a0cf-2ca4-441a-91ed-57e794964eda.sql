-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_set_work_order_number ON public.work_orders;

-- Make work_order_number NOT NULL (skip if already done)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'work_orders' 
    AND column_name = 'work_order_number' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE public.work_orders ALTER COLUMN work_order_number SET NOT NULL;
  END IF;
END $$;

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_work_order_number_per_tenant'
  ) THEN
    ALTER TABLE public.work_orders 
    ADD CONSTRAINT unique_work_order_number_per_tenant 
    UNIQUE (tenant_id, work_order_number);
  END IF;
END $$;

-- Recreate the trigger
CREATE TRIGGER trigger_set_work_order_number
  BEFORE INSERT ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_work_order_number();