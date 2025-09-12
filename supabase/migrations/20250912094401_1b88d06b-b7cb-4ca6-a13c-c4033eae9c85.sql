-- Create address_contacts table
CREATE TABLE public.address_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address_id UUID NOT NULL,
  title VARCHAR(20),
  name VARCHAR(255) NOT NULL,
  job_title VARCHAR(255),
  department VARCHAR(255),
  telephone VARCHAR(50),
  extension VARCHAR(20),
  mobile VARCHAR(50),
  email VARCHAR(255),
  general_notes TEXT,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_address_contacts_address_id FOREIGN KEY (address_id) 
    REFERENCES public.addresses(id) ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX idx_address_contacts_address_id ON public.address_contacts(address_id);
CREATE INDEX idx_address_contacts_tenant_id ON public.address_contacts(tenant_id);

-- Enable RLS
ALTER TABLE public.address_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view address contacts in their tenant" 
ON public.address_contacts 
FOR SELECT 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can create address contacts in their tenant" 
ON public.address_contacts 
FOR INSERT 
WITH CHECK (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can update address contacts in their tenant" 
ON public.address_contacts 
FOR UPDATE 
USING (tenant_id = get_current_user_tenant_id());

CREATE POLICY "Users can delete address contacts in their tenant" 
ON public.address_contacts 
FOR DELETE 
USING (tenant_id = get_current_user_tenant_id());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_address_contacts_updated_at
BEFORE UPDATE ON public.address_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();