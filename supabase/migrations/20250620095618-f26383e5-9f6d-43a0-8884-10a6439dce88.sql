
-- Create asset_tag_prefix_audit_log table
CREATE TABLE public.asset_tag_prefix_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prefix_id UUID NOT NULL REFERENCES public.asset_tag_prefixes(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  changed_by UUID NOT NULL REFERENCES public.users(id),
  change_summary TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id)
);

-- Add trigger for updated_at on asset_tag_prefix_audit_log
CREATE TRIGGER update_asset_tag_prefix_audit_log_updated_at 
  BEFORE UPDATE ON public.asset_tag_prefix_audit_log 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on asset_tag_prefix_audit_log table
ALTER TABLE public.asset_tag_prefix_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for asset_tag_prefix_audit_log
CREATE POLICY "Users can view audit logs in their tenant" 
  ON public.asset_tag_prefix_audit_log 
  FOR SELECT 
  USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

CREATE POLICY "Users can insert audit logs in their tenant" 
  ON public.asset_tag_prefix_audit_log 
  FOR INSERT 
  WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Create function to automatically log prefix changes
CREATE OR REPLACE FUNCTION public.log_asset_prefix_changes()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
  tenant_id_var UUID;
  change_summary_text TEXT := '';
BEGIN
  -- Get current user and tenant
  SELECT id, tenant_id INTO current_user_id, tenant_id_var 
  FROM public.users 
  WHERE id = auth.uid() 
  LIMIT 1;
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Handle different trigger operations
  IF TG_OP = 'INSERT' THEN
    change_summary_text := 'Created new prefix: ' || NEW.prefix_letter || NEW.number_code || ' (' || NEW.description || ')';
    
    INSERT INTO public.asset_tag_prefix_audit_log (
      prefix_id, action, changed_by, change_summary, tenant_id
    ) VALUES (
      NEW.id, 'created', current_user_id, change_summary_text, tenant_id_var
    );
    
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Build change summary for updates
    IF OLD.prefix_letter != NEW.prefix_letter THEN
      change_summary_text := change_summary_text || 'Updated prefix letter from ''' || OLD.prefix_letter || ''' to ''' || NEW.prefix_letter || '''. ';
    END IF;
    
    IF OLD.number_code != NEW.number_code THEN
      change_summary_text := change_summary_text || 'Updated number code from ''' || OLD.number_code || ''' to ''' || NEW.number_code || '''. ';
    END IF;
    
    IF OLD.description != NEW.description THEN
      change_summary_text := change_summary_text || 'Updated description from ''' || OLD.description || ''' to ''' || NEW.description || '''. ';
    END IF;
    
    -- Only log if there were actual changes
    IF change_summary_text != '' THEN
      INSERT INTO public.asset_tag_prefix_audit_log (
        prefix_id, action, changed_by, change_summary, tenant_id
      ) VALUES (
        NEW.id, 'updated', current_user_id, TRIM(change_summary_text), tenant_id_var
      );
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    change_summary_text := 'Deleted prefix: ' || OLD.prefix_letter || OLD.number_code || ' (' || OLD.description || ')';
    
    INSERT INTO public.asset_tag_prefix_audit_log (
      prefix_id, action, changed_by, change_summary, tenant_id
    ) VALUES (
      OLD.id, 'deleted', current_user_id, change_summary_text, tenant_id_var
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log changes
CREATE TRIGGER asset_prefix_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.asset_tag_prefixes
  FOR EACH ROW EXECUTE FUNCTION public.log_asset_prefix_changes();
