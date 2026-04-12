-- Drop the existing authenticated-only select policy
DROP POLICY IF EXISTS "Anyone can view business_types" ON public.business_types;

-- Create a public select policy for anon + authenticated
CREATE POLICY "Anyone can view business_types"
ON public.business_types
FOR SELECT
TO anon, authenticated
USING (true);