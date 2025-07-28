-- Add enhanced logging to work order number generation function
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
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
  
  -- Get the latest work order number from the table
  SELECT work_order_number INTO latest_work_order_number
  FROM public.work_orders 
  WHERE work_order_number ~ '^WO[0-9]+$'
  ORDER BY CAST(SUBSTRING(work_order_number FROM 3) AS INTEGER) DESC
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
        RAISE LOG 'Failed to parse last suffix; defaulting to WO001. Error: %', SQLERRM;
    END;
  ELSE
    -- No work orders found, start with 1
    next_number := 1;
    RAISE LOG 'No work orders found, starting with WO001';
  END IF;
  
  -- Format with leading zeros (minimum 3 digits): WO001, WO002, etc.
  work_order_number := 'WO' || LPAD(next_number::TEXT, 3, '0');
  
  -- Log the generated work order number
  RAISE LOG 'Generated work order number: %', work_order_number;
  
  RETURN work_order_number;
END;
$function$;