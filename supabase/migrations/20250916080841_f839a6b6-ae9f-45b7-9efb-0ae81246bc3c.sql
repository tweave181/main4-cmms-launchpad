-- Fix the generate_work_order_number function to properly filter by tenant and fix ambiguous column reference
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  next_number INTEGER;
  work_order_number TEXT;
  latest_work_order_number TEXT;
  tenant_id_for_context UUID;
BEGIN
  -- Get current user's tenant ID for context
  SELECT get_current_user_tenant_id() INTO tenant_id_for_context;
  
  -- Log tenant ID being used for the query
  RAISE LOG 'Generating work order number for tenant: %', tenant_id_for_context;
  
  -- Get the latest work order number from the table for this tenant only
  SELECT wo.work_order_number INTO latest_work_order_number
  FROM public.work_orders wo
  WHERE wo.tenant_id = tenant_id_for_context
    AND wo.work_order_number ~ '^WO[0-9]+$'
  ORDER BY CAST(SUBSTRING(wo.work_order_number FROM 3) AS INTEGER) DESC
  LIMIT 1;
  
  -- Log the latest work order number found
  RAISE LOG 'Latest work order number found: %', COALESCE(latest_work_order_number, 'NULL');
  
  -- Parse the numeric suffix from the latest work order number
  IF latest_work_order_number IS NOT NULL THEN
    BEGIN
      next_number := CAST(SUBSTRING(latest_work_order_number FROM 3) AS INTEGER) + 1;
      RAISE LOG 'Parsed suffix: %, Next number will be: %', 
        SUBSTRING(latest_work_order_number FROM 3), next_number;
    EXCEPTION
      WHEN OTHERS THEN
        -- Parsing failed, default to 1
        next_number := 1;
        RAISE LOG 'Failed to parse last suffix; defaulting to WO0001. Error: %', SQLERRM;
    END;
  ELSE
    -- No work orders found, start with 1
    next_number := 1;
    RAISE LOG 'No work orders found, starting with WO0001';
  END IF;
  
  -- Format with leading zeros (4 digits): WO0001, WO0002, etc.
  work_order_number := 'WO' || LPAD(next_number::TEXT, 4, '0');
  
  -- Log the generated work order number
  RAISE LOG 'Generated work order number: %', work_order_number;
  
  RETURN work_order_number;
END;
$function$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS set_work_order_number_trigger ON public.work_orders;

CREATE TRIGGER set_work_order_number_trigger
  BEFORE INSERT ON public.work_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_work_order_number();