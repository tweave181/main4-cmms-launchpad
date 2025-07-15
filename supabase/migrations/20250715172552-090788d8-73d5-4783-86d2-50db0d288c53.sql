-- Create a function to run daily contract reminder checks
-- This will be called by pg_cron to send email reminders
CREATE OR REPLACE FUNCTION public.trigger_contract_reminder_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Call the edge function to process contract reminders
  -- Note: This requires pg_net extension to be enabled
  PERFORM
    net.http_post(
      url := 'https://mzpweuuvyuaawpttoqkn.supabase.co/functions/v1/contract-reminder-emails',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cHdldXV2eXVhYXdwdHRvcWtuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMTM4ODUsImV4cCI6MjA2NDg4OTg4NX0.7EbVEOq7uoOTMp2DpD5IdXVLR1uK6FcqVp1o2aP9NC8"}'::jsonb,
      body := '{}'::jsonb
    );
END;
$$;

-- Schedule the function to run daily at 9 AM
-- Note: This requires the pg_cron extension to be enabled
-- You may need to enable this in the Supabase dashboard under Database > Extensions
SELECT cron.schedule(
  'daily-contract-reminder-emails',
  '0 9 * * *', -- Daily at 9 AM UTC
  'SELECT public.trigger_contract_reminder_emails();'
);