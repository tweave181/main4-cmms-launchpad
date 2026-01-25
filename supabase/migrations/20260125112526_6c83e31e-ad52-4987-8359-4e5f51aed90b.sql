-- Add barcode_printed_at column to inventory_parts for print tracking
ALTER TABLE public.inventory_parts 
ADD COLUMN barcode_printed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;