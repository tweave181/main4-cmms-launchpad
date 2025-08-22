-- Add supplier_id column to inventory_parts table to link parts to suppliers
ALTER TABLE inventory_parts
  ADD COLUMN supplier_id UUID NULL,
  ADD CONSTRAINT fk_inventory_parts_supplier
    FOREIGN KEY (supplier_id) REFERENCES addresses(id) ON DELETE SET NULL;