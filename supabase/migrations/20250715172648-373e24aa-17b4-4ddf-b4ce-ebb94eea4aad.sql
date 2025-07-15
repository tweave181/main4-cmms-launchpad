-- Create a function to manually trigger contract reminder emails
-- This can be called directly or scheduled externally
CREATE OR REPLACE FUNCTION public.trigger_contract_reminder_emails()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  contracts_processed INTEGER := 0;
  contract_record RECORD;
  admin_record RECORD;
  days_until_expiry INTEGER;
  today_date DATE := CURRENT_DATE;
  reminder_date DATE;
BEGIN
  -- Find contracts that need reminders today
  FOR contract_record IN
    SELECT 
      sc.id,
      sc.contract_title,
      sc.vendor_name,
      sc.end_date,
      sc.reminder_days_before,
      sc.tenant_id,
      t.name as tenant_name
    FROM service_contracts sc
    JOIN tenants t ON t.id = sc.tenant_id
    WHERE sc.email_reminder_enabled = true
    AND sc.reminder_days_before IS NOT NULL
    AND sc.end_date >= today_date
  LOOP
    -- Calculate reminder date
    reminder_date := contract_record.end_date - INTERVAL '1 day' * contract_record.reminder_days_before;
    
    -- Check if today is the reminder date
    IF reminder_date = today_date THEN
      -- Calculate days until expiry
      days_until_expiry := contract_record.end_date - today_date;
      
      -- Get admin users for this tenant
      FOR admin_record IN
        SELECT id, email, name
        FROM users
        WHERE tenant_id = contract_record.tenant_id
        AND role = 'admin'
      LOOP
        -- Log the email reminder (in practice, you'd send the actual email here)
        INSERT INTO contract_reminders_log (
          contract_id,
          user_id,
          delivery_method,
          tenant_id
        ) VALUES (
          contract_record.id,
          admin_record.id,
          'email',
          contract_record.tenant_id
        );
        
        contracts_processed := contracts_processed + 1;
      END LOOP;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'contracts_processed', contracts_processed,
    'processed_date', today_date
  );
END;
$$;