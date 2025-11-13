-- Add low stock alerts to notification settings
ALTER TABLE public.notification_settings 
ADD COLUMN IF NOT EXISTS low_stock_alerts_enabled BOOLEAN DEFAULT true;