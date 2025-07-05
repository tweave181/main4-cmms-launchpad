-- Add work_order_number column to work_orders table
ALTER TABLE public.work_orders ADD COLUMN work_order_number TEXT UNIQUE;

-- Create a function to generate the next work order number
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger function to automatically set work_order_number on insert
CREATE OR REPLACE FUNCTION public.set_work_order_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set if not already provided
  IF NEW.work_order_number IS NULL THEN
    NEW.work_order_number := public.generate_work_order_number();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER trigger_set_work_order_number
  BEFORE INSERT ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_work_order_number();

-- Update existing work orders to have work order numbers
DO $$
DECLARE
  wo_record RECORD;
  counter INTEGER := 1;
BEGIN
  FOR wo_record IN 
    SELECT id FROM public.work_orders 
    WHERE work_order_number IS NULL 
    ORDER BY created_at ASC
  LOOP
    UPDATE public.work_orders 
    SET work_order_number = 'WO-' || LPAD(counter::TEXT, 4, '0')
    WHERE id = wo_record.id;
    
    counter := counter + 1;
  END LOOP;
END $$;