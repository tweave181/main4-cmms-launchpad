-- Update generate_work_order_number function for globally unique numbers with WO-0001 format
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
BEGIN
  -- Log that we're generating a globally unique work order number
  RAISE LOG 'Generating globally unique work order number';
  
  -- Get the latest work order number from ALL tenants (globally unique)
  -- Handle both "WO-0001" and "WO0001" formats for backward compatibility
  SELECT wo.work_order_number INTO latest_work_order_number
  FROM public.work_orders wo
  WHERE wo.work_order_number ~ '^WO-?[0-9]+$'
  ORDER BY 
    CASE 
      WHEN wo.work_order_number ~ '^WO-[0-9]+$' THEN 
        CAST(SUBSTRING(wo.work_order_number FROM 4) AS INTEGER)
      ELSE 
        CAST(SUBSTRING(wo.work_order_number FROM 3) AS INTEGER)
    END DESC
  LIMIT 1;
  
  -- Log the latest work order number found
  RAISE LOG 'Latest work order number found globally: %', COALESCE(latest_work_order_number, 'NULL');
  
  -- Parse the numeric suffix from the latest work order number
  IF latest_work_order_number IS NOT NULL THEN
    BEGIN
      -- Handle both formats: "WO-0001" and "WO0001"
      IF latest_work_order_number ~ '^WO-[0-9]+$' THEN
        next_number := CAST(SUBSTRING(latest_work_order_number FROM 4) AS INTEGER) + 1;
      ELSE
        next_number := CAST(SUBSTRING(latest_work_order_number FROM 3) AS INTEGER) + 1;
      END IF;
      
      RAISE LOG 'Parsed number from latest work order, next number will be: %', next_number;
    EXCEPTION
      WHEN OTHERS THEN
        -- Parsing failed, default to 1
        next_number := 1;
        RAISE LOG 'Failed to parse last number; defaulting to WO-0001. Error: %', SQLERRM;
    END;
  ELSE
    -- No work orders found, start with 1
    next_number := 1;
    RAISE LOG 'No work orders found globally, starting with WO-0001';
  END IF;
  
  -- Format with leading zeros and dash: WO-0001, WO-0002, etc.
  work_order_number := 'WO-' || LPAD(next_number::TEXT, 4, '0');
  
  -- Log the generated work order number
  RAISE LOG 'Generated globally unique work order number: %', work_order_number;
  
  RETURN work_order_number;
END;
$function$;