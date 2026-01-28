-- Add email verification columns to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS verification_token_expires_at TIMESTAMP WITH TIME ZONE;

-- Create index on verification token for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_verification_token ON public.customers(verification_token) WHERE verification_token IS NOT NULL;

-- Update RLS to allow anonymous signup (insert only with specific columns)
CREATE POLICY "Allow anonymous customer signup"
ON public.customers
FOR INSERT
TO anon
WITH CHECK (
  -- Only allow insert with minimal required fields, no sensitive access
  tenant_id IS NOT NULL AND
  name IS NOT NULL AND
  email IS NOT NULL AND
  password_hash IS NOT NULL
);