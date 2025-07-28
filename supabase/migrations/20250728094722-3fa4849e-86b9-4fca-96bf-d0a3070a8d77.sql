-- Update the work order number generation to use WO001 format instead of WO-0001
CREATE OR REPLACE FUNCTION public.generate_work_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  next_number INTEGER;
  work_order_number TEXT;
BEGIN
  -- Get the next sequence number by finding the highest existing number
  SELECT COALESCE(
    MAX(
      CASE 
        WHEN work_order_number ~ '^WO[0-9]+$' 
        THEN CAST(SUBSTRING(work_order_number FROM 3) AS INTEGER)
        ELSE 0
      END
    ), 0
  ) + 1 INTO next_number
  FROM public.work_orders;
  
  -- Format with leading zeros (minimum 3 digits): WO001, WO002, etc.
  work_order_number := 'WO' || LPAD(next_number::TEXT, 3, '0');
  
  RETURN work_order_number;
END;
$function$;