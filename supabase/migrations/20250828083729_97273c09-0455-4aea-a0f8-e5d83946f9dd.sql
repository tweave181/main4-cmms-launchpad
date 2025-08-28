-- Add unique index for case-insensitive company names to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS ux_company_name_ci
  ON public.company_details (tenant_id, lower(company_name));