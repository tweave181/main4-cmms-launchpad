-- Fix the ambiguous column reference in the trigger function
CREATE OR REPLACE FUNCTION public.set_work_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only set if not already provided
  IF NEW.work_order_number IS NULL THEN
    NEW.work_order_number := public.generate_work_order_number();
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS set_work_order_number_trigger ON public.work_orders;
CREATE TRIGGER set_work_order_number_trigger
  BEFORE INSERT ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_work_order_number();