-- Add column to track when barcode label was printed
ALTER TABLE public.assets 
ADD COLUMN barcode_printed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;