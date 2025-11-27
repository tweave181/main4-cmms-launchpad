-- Migration: Transfer pm_schedule_template_items to checklist_records structure
-- This migration creates checklist records from existing PM schedule template items

DO $$
DECLARE
  pm_schedule_record RECORD;
  new_checklist_record_id UUID;
  template_item_record RECORD;
BEGIN
  -- Loop through each PM schedule that has template items
  FOR pm_schedule_record IN
    SELECT DISTINCT 
      pms.id as schedule_id,
      pms.name as schedule_name,
      pms.tenant_id,
      pms.created_by
    FROM preventive_maintenance_schedules pms
    INNER JOIN pm_schedule_template_items psti ON psti.pm_schedule_id = pms.id
    WHERE pms.checklist_record_id IS NULL
  LOOP
    -- Create a new checklist record for this PM schedule
    INSERT INTO checklist_records (
      tenant_id,
      name,
      description,
      created_by,
      is_active
    ) VALUES (
      pm_schedule_record.tenant_id,
      pm_schedule_record.schedule_name || ' - Checklist',
      'Migrated from pm_schedule_template_items',
      pm_schedule_record.created_by,
      true
    )
    RETURNING id INTO new_checklist_record_id;

    -- Copy all template items to checklist_record_lines
    FOR template_item_record IN
      SELECT 
        template_item_id,
        sort_order
      FROM pm_schedule_template_items
      WHERE pm_schedule_id = pm_schedule_record.schedule_id
      ORDER BY sort_order
    LOOP
      INSERT INTO checklist_record_lines (
        checklist_record_id,
        checklist_line_id,
        sort_order
      ) VALUES (
        new_checklist_record_id,
        template_item_record.template_item_id,
        template_item_record.sort_order
      );
    END LOOP;

    -- Update the PM schedule to reference the new checklist record
    UPDATE preventive_maintenance_schedules
    SET checklist_record_id = new_checklist_record_id
    WHERE id = pm_schedule_record.schedule_id;

    RAISE NOTICE 'Migrated PM schedule % (%) to checklist record %', 
      pm_schedule_record.schedule_name, 
      pm_schedule_record.schedule_id, 
      new_checklist_record_id;
  END LOOP;
END $$;

-- Add a comment to the old table noting it's deprecated
COMMENT ON TABLE pm_schedule_template_items IS 'DEPRECATED: This table is kept for historical reference. New data should use checklist_records and checklist_record_lines instead.';