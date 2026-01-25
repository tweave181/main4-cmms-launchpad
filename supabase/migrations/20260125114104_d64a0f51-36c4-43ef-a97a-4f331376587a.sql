-- Add sku_code column to spare_parts_categories
ALTER TABLE public.spare_parts_categories 
ADD COLUMN sku_code VARCHAR(3) DEFAULT NULL;

-- Create function to generate SKU code from category name
CREATE OR REPLACE FUNCTION public.generate_sku_code(category_name TEXT)
RETURNS VARCHAR(3)
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public'
AS $$
BEGIN
  -- Take first 3 letters, uppercase, remove non-letters
  RETURN UPPER(LEFT(REGEXP_REPLACE(category_name, '[^A-Za-z]', '', 'g'), 3));
END;
$$;

-- Create function to generate next inventory SKU for a category
CREATE OR REPLACE FUNCTION public.generate_next_inventory_sku(
  p_tenant_id UUID,
  p_category_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_sku_code VARCHAR(3);
  v_max_seq INT;
  v_next_sku TEXT;
BEGIN
  -- Get the SKU code for this category
  SELECT sku_code INTO v_sku_code
  FROM spare_parts_categories
  WHERE id = p_category_id;
  
  IF v_sku_code IS NULL THEN
    RAISE EXCEPTION 'Category does not have an SKU code';
  END IF;
  
  -- Find the highest sequence number for this code pattern
  SELECT COALESCE(MAX(CAST(SUBSTRING(sku FROM 4) AS INT)), 0) INTO v_max_seq
  FROM inventory_parts
  WHERE tenant_id = p_tenant_id
    AND sku ~ ('^' || v_sku_code || '[0-9]{4}$');
  
  -- Check for capacity
  IF v_max_seq >= 9999 THEN
    RAISE EXCEPTION 'SKU code % has reached maximum capacity (9999)', v_sku_code;
  END IF;
  
  -- Generate next SKU with zero-padded sequence
  v_next_sku := v_sku_code || LPAD((v_max_seq + 1)::TEXT, 4, '0');
  
  RETURN v_next_sku;
END;
$$;

-- Populate sku_code for existing categories with conflict resolution
WITH initial_codes AS (
  SELECT 
    id,
    tenant_id,
    name,
    public.generate_sku_code(name) as base_code,
    ROW_NUMBER() OVER (
      PARTITION BY tenant_id, public.generate_sku_code(name) 
      ORDER BY created_at
    ) as code_rank
  FROM spare_parts_categories
  WHERE sku_code IS NULL
)
UPDATE spare_parts_categories spc
SET sku_code = CASE 
  WHEN ic.code_rank = 1 THEN ic.base_code
  WHEN ic.code_rank <= 9 THEN LEFT(ic.base_code, 2) || ic.code_rank::TEXT
  ELSE LEFT(ic.base_code, 1) || ic.code_rank::TEXT
END
FROM initial_codes ic
WHERE spc.id = ic.id;

-- Migrate existing inventory parts to new SKU format
WITH numbered_parts AS (
  SELECT 
    ip.id,
    COALESCE(spc.sku_code, 'UNC') as sku_code,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE(spc.sku_code, 'UNC'), ip.tenant_id 
      ORDER BY ip.created_at
    ) as seq_num
  FROM inventory_parts ip
  LEFT JOIN spare_parts_categories spc ON ip.spare_parts_category_id = spc.id
)
UPDATE inventory_parts ip
SET sku = np.sku_code || LPAD(np.seq_num::TEXT, 4, '0')
FROM numbered_parts np
WHERE ip.id = np.id;