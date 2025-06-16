
-- Create enum type for employment status
CREATE TYPE public.employment_status AS ENUM ('Full Time', 'Part Time', 'Bank Staff', 'Contractor');

-- Add new columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS employment_status employment_status DEFAULT 'Full Time',
ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id);

-- Update the existing status column to use a proper enum if needed
-- (keeping the existing status column as is since it's already being used for active/inactive)

-- Add index for better performance on department lookups
CREATE INDEX IF NOT EXISTS idx_users_department_id ON public.users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_department ON public.users(tenant_id, department_id);
