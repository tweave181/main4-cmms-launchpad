-- Create address audit log table
CREATE TABLE public.address_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  changed_by UUID NOT NULL,
  change_summary TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tenant_id UUID NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.address_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for address audit log
CREATE POLICY "Admin users can view address audit logs in their tenant" 
ON public.address_audit_log 
FOR SELECT 
USING (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()) AND
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can insert address audit logs in their tenant" 
ON public.address_audit_log 
FOR INSERT 
WITH CHECK (
  tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
);

-- Add foreign key constraints
ALTER TABLE public.address_audit_log 
ADD CONSTRAINT address_audit_log_changed_by_fkey 
FOREIGN KEY (changed_by) REFERENCES public.users(id);

ALTER TABLE public.address_audit_log 
ADD CONSTRAINT address_audit_log_record_id_fkey 
FOREIGN KEY (record_id) REFERENCES public.addresses(id);

ALTER TABLE public.address_audit_log 
ADD CONSTRAINT address_audit_log_tenant_id_fkey 
FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);

-- Create audit logging function for addresses
CREATE OR REPLACE FUNCTION public.log_address_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_user_id UUID;
  tenant_id_var UUID;
  change_summary_text TEXT := '';
  address_preview TEXT;
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
    -- Format address preview
    address_preview := NEW.address_line_1;
    IF NEW.town_or_city IS NOT NULL THEN
      address_preview := address_preview || ', ' || NEW.town_or_city;
    END IF;
    IF NEW.postcode IS NOT NULL THEN
      address_preview := address_preview || ', ' || NEW.postcode;
    END IF;
    
    change_summary_text := 'Address Created: ' || address_preview;
    
    INSERT INTO public.address_audit_log (
      record_id, action, changed_by, change_summary, tenant_id
    ) VALUES (
      NEW.id, 'created', current_user_id, change_summary_text, tenant_id_var
    );
    
    RETURN NEW;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Build change summary for updates
    IF OLD.address_line_1 != NEW.address_line_1 THEN
      change_summary_text := change_summary_text || 'Updated line 1 from ''' || OLD.address_line_1 || ''' to ''' || NEW.address_line_1 || '''. ';
    END IF;
    
    IF COALESCE(OLD.address_line_2, '') != COALESCE(NEW.address_line_2, '') THEN
      change_summary_text := change_summary_text || 'Updated line 2 from ''' || COALESCE(OLD.address_line_2, '') || ''' to ''' || COALESCE(NEW.address_line_2, '') || '''. ';
    END IF;
    
    IF COALESCE(OLD.town_or_city, '') != COALESCE(NEW.town_or_city, '') THEN
      change_summary_text := change_summary_text || 'Updated town/city from ''' || COALESCE(OLD.town_or_city, '') || ''' to ''' || COALESCE(NEW.town_or_city, '') || '''. ';
    END IF;
    
    IF COALESCE(OLD.postcode, '') != COALESCE(NEW.postcode, '') THEN
      change_summary_text := change_summary_text || 'Updated postcode from ''' || COALESCE(OLD.postcode, '') || ''' to ''' || COALESCE(NEW.postcode, '') || '''. ';
    END IF;
    
    -- Only log if there were actual changes
    IF change_summary_text != '' THEN
      INSERT INTO public.address_audit_log (
        record_id, action, changed_by, change_summary, tenant_id
      ) VALUES (
        NEW.id, 'updated', current_user_id, TRIM(change_summary_text), tenant_id_var
      );
    END IF;
    
    RETURN NEW;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Format address preview for deletion
    address_preview := OLD.address_line_1;
    IF OLD.town_or_city IS NOT NULL THEN
      address_preview := address_preview || ', ' || OLD.town_or_city;
    END IF;
    IF OLD.postcode IS NOT NULL THEN
      address_preview := address_preview || ', ' || OLD.postcode;
    END IF;
    
    change_summary_text := 'Address Deleted: ' || address_preview;
    
    INSERT INTO public.address_audit_log (
      record_id, action, changed_by, change_summary, tenant_id
    ) VALUES (
      OLD.id, 'deleted', current_user_id, change_summary_text, tenant_id_var
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Create trigger for address audit logging
DROP TRIGGER IF EXISTS audit_address_changes ON public.addresses;
CREATE TRIGGER audit_address_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.log_address_changes();