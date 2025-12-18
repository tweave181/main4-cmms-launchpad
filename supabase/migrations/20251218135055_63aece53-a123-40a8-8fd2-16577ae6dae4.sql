-- Update generate_location_code function to include numbers from the name
CREATE OR REPLACE FUNCTION public.generate_location_code(location_name text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  code TEXT;
  clean_name TEXT;
  letters_only TEXT;
  numbers_only TEXT;
BEGIN
  -- Convert to uppercase
  clean_name := UPPER(location_name);
  
  -- Extract letters (for abbreviation)
  letters_only := REGEXP_REPLACE(clean_name, '[^A-Z]', '', 'g');
  
  -- Extract numbers (to append)
  numbers_only := REGEXP_REPLACE(clean_name, '[^0-9]', '', 'g');
  
  -- Take first 2-3 letters depending on whether we have numbers
  code := LEFT(letters_only, CASE WHEN LENGTH(numbers_only) > 0 THEN 2 ELSE 3 END);
  
  -- Ensure minimum 2 letters
  IF LENGTH(code) < 2 THEN
    code := RPAD(code, 2, 'X');
  END IF;
  
  -- Append numbers if present (limit to keep total ≤ 5 chars)
  IF LENGTH(numbers_only) > 0 THEN
    code := code || LEFT(numbers_only, 5 - LENGTH(code));
  END IF;
  
  RETURN code;
END;
$function$;

-- Update set_location_code trigger function to allow numbers after first letter
CREATE OR REPLACE FUNCTION public.set_location_code()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Auto-generate code if not provided or empty
  IF NEW.location_code IS NULL OR TRIM(NEW.location_code) = '' THEN
    NEW.location_code := public.ensure_unique_location_code(NEW.tenant_id, NEW.name);
  ELSE
    -- Validate manually provided code
    IF LENGTH(NEW.location_code) < 2 OR LENGTH(NEW.location_code) > 5 THEN
      RAISE EXCEPTION 'Location code must be between 2 and 5 characters';
    END IF;
    
    IF NEW.location_code !~ '^[A-Z][A-Z0-9]*$' THEN
      RAISE EXCEPTION 'Location code must start with a letter and contain only uppercase letters and numbers';
    END IF;
    
    -- Ensure uniqueness for manually provided codes
    IF EXISTS (
      SELECT 1 FROM public.locations 
      WHERE tenant_id = NEW.tenant_id 
        AND location_code = NEW.location_code 
        AND (TG_OP = 'INSERT' OR id != NEW.id)
    ) THEN
      RAISE EXCEPTION 'Location code % already exists in this tenant', NEW.location_code;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update ensure_unique_location_code function to validate codes with numbers
CREATE OR REPLACE FUNCTION public.ensure_unique_location_code(p_tenant_id uuid, p_name text, p_existing_code text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
  base_code TEXT;
  final_code TEXT;
  counter INTEGER := 1;
BEGIN
  -- Generate base code from name
  base_code := public.generate_location_code(p_name);
  final_code := base_code;
  
  -- If an existing code is provided, use it (now allows numbers after first letter)
  IF p_existing_code IS NOT NULL AND LENGTH(p_existing_code) >= 2 AND p_existing_code ~ '^[A-Z][A-Z0-9]*$' THEN
    final_code := p_existing_code;
  END IF;
  
  -- Check for uniqueness and add suffix if needed
  WHILE EXISTS (
    SELECT 1 FROM public.locations 
    WHERE tenant_id = p_tenant_id AND location_code = final_code
  ) LOOP
    final_code := base_code || counter::TEXT;
    counter := counter + 1;
    
    -- Prevent infinite loop
    IF counter > 999 THEN
      RAISE EXCEPTION 'Unable to generate unique location code for name: %', p_name;
    END IF;
  END LOOP;
  
  RETURN final_code;
END;
$function$;