
-- customer_sessions: service-role only. Add explicit deny-all policy for authenticated/anon
-- so the linter no longer flags "RLS enabled, no policy". Service role bypasses RLS.
DROP POLICY IF EXISTS "Deny all client access to customer_sessions" ON public.customer_sessions;

CREATE POLICY "Deny all client access to customer_sessions"
ON public.customer_sessions
AS RESTRICTIVE
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);
