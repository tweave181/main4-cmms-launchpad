-- Update the two existing inventory records to Consumables type
UPDATE public.inventory_parts 
SET inventory_type = 'consumables'
WHERE id IN (
  '4648ff24-f596-4b8d-a50a-1b0f7c458e53',
  '99b41e48-d2ce-4b97-83d8-8d47f6ed0413'
);