-- Add low_stock_alert_days column to notification_settings
ALTER TABLE notification_settings 
ADD COLUMN low_stock_alert_days integer[] DEFAULT ARRAY[1,2,3,4,5];

COMMENT ON COLUMN notification_settings.low_stock_alert_days IS 'Days of week to run low stock alerts (0=Sunday, 6=Saturday). Default is Mon-Fri.';