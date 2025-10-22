-- Fix search_path for prevent_safety_critical_deletion function
CREATE OR REPLACE FUNCTION public.prevent_safety_critical_deletion()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.safety_critical = true THEN
    IF EXISTS (
      SELECT 1 FROM public.pm_schedule_template_items
      WHERE template_item_id = OLD.id
    ) THEN
      RAISE EXCEPTION 'Cannot delete safety-critical checklist item that is in use by PM schedules';
    END IF;
  END IF;
  RETURN OLD;
END;
$$;

-- Fix search_path for prevent_safety_critical_removal function
CREATE OR REPLACE FUNCTION public.prevent_safety_critical_removal()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  is_safety_critical BOOLEAN;
BEGIN
  SELECT safety_critical INTO is_safety_critical
  FROM public.checklist_item_templates
  WHERE id = OLD.template_item_id;
  
  IF is_safety_critical = true THEN
    RAISE EXCEPTION 'Cannot remove safety-critical checklist item from PM schedule';
  END IF;
  
  RETURN OLD;
END;
$$;