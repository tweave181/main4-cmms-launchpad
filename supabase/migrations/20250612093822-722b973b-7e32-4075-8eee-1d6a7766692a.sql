
-- Add assigned_to field to preventive_maintenance_schedules table
ALTER TABLE preventive_maintenance_schedules 
ADD COLUMN assigned_to uuid REFERENCES users(id);

-- Create checklist items table for PM schedules
CREATE TABLE pm_schedule_checklist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pm_schedule_id uuid NOT NULL REFERENCES preventive_maintenance_schedules(id) ON DELETE CASCADE,
  item_text text NOT NULL,
  item_type text NOT NULL DEFAULT 'checkbox' CHECK (item_type IN ('checkbox', 'value')),
  sort_order integer NOT NULL DEFAULT 1,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add RLS policies for checklist items
ALTER TABLE pm_schedule_checklist_items ENABLE ROW LEVEL SECURITY;

-- Users can view checklist items for their tenant's PM schedules
CREATE POLICY "Users can view checklist items for their tenant" 
  ON pm_schedule_checklist_items 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM preventive_maintenance_schedules pms 
      INNER JOIN users u ON u.tenant_id = pms.tenant_id 
      WHERE pms.id = pm_schedule_checklist_items.pm_schedule_id 
      AND u.id = auth.uid()
    )
  );

-- Users can insert checklist items for their tenant's PM schedules
CREATE POLICY "Users can create checklist items for their tenant" 
  ON pm_schedule_checklist_items 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM preventive_maintenance_schedules pms 
      INNER JOIN users u ON u.tenant_id = pms.tenant_id 
      WHERE pms.id = pm_schedule_checklist_items.pm_schedule_id 
      AND u.id = auth.uid()
    )
  );

-- Users can update checklist items for their tenant's PM schedules
CREATE POLICY "Users can update checklist items for their tenant" 
  ON pm_schedule_checklist_items 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM preventive_maintenance_schedules pms 
      INNER JOIN users u ON u.tenant_id = pms.tenant_id 
      WHERE pms.id = pm_schedule_checklist_items.pm_schedule_id 
      AND u.id = auth.uid()
    )
  );

-- Users can delete checklist items for their tenant's PM schedules
CREATE POLICY "Users can delete checklist items for their tenant" 
  ON pm_schedule_checklist_items 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM preventive_maintenance_schedules pms 
      INNER JOIN users u ON u.tenant_id = pms.tenant_id 
      WHERE pms.id = pm_schedule_checklist_items.pm_schedule_id 
      AND u.id = auth.uid()
    )
  );

-- Add trigger for updating updated_at timestamp
CREATE TRIGGER update_pm_schedule_checklist_items_updated_at
  BEFORE UPDATE ON pm_schedule_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
