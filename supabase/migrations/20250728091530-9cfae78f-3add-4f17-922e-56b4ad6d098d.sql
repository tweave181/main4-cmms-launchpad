-- Create function to generate work order numbers
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_number INTEGER;
  work_order_number TEXT;
BEGIN
  -- Get the next sequence number by finding the highest existing number
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN work_order_number ~ '^WO-[0-9]+$' 
        THEN CAST(SUBSTRING(work_order_number FROM 4) AS INTEGER)
        ELSE 0
      END
    ), 0
  ) + 1 INTO next_number
  FROM public.work_orders;
  
  -- Format with leading zeros (minimum 4 digits)
  work_order_number := 'WO-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN work_order_number;
END;
$$;

-- Create trigger function to set work order number
CREATE OR REPLACE FUNCTION public.set_work_order_number()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only set if not already provided
  IF NEW.work_order_number IS NULL THEN
    NEW.work_order_number := public.generate_work_order_number();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate work order numbers
CREATE TRIGGER trigger_set_work_order_number
  BEFORE INSERT ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_work_order_number();

-- Make work_order_number NOT NULL and add unique constraint
ALTER TABLE public.work_orders 
ALTER COLUMN work_order_number SET NOT NULL;

-- Add unique constraint on work_order_number per tenant
ALTER TABLE public.work_orders 
ADD CONSTRAINT unique_work_order_number_per_tenant 
UNIQUE (tenant_id, work_order_number);