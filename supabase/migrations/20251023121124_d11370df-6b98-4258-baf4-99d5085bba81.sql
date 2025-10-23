-- Add image_name column to store user-friendly names for checklist item images
ALTER TABLE checklist_item_templates 
ADD COLUMN image_name TEXT;

-- Update existing records to use item_text as default image name
UPDATE checklist_item_templates 
SET image_name = item_text 
WHERE image_url IS NOT NULL AND image_name IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN checklist_item_templates.image_name IS 'User-friendly name for the associated image file';