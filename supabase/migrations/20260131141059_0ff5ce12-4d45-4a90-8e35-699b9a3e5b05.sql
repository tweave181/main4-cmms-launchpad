-- Add subdomain column to tenants for customer portal access
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS subdomain TEXT UNIQUE;

-- Create index for faster subdomain lookups
CREATE INDEX IF NOT EXISTS idx_tenants_subdomain ON public.tenants(subdomain) WHERE subdomain IS NOT NULL;