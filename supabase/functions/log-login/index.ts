import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Unauthorized - No auth header' }), { 
        status: 401, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }

    // Create client with anon key and auth header for user operations
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    // Get user from JWT token with retry logic
    let user = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries && !user) {
      try {
        const { data: { user: authUser }, error: userErr } = await supabase.auth.getUser();
        if (userErr) {
          console.error(`Failed to get user (attempt ${retryCount + 1}):`, userErr);
          if (retryCount === maxRetries - 1) {
            return new Response(JSON.stringify({ error: 'Unauthorized - Invalid token' }), { 
              status: 401, 
              headers: { "Content-Type": "application/json", ...corsHeaders } 
            });
          }
        } else if (authUser) {
          user = authUser;
          break;
        }
      } catch (err) {
        console.error(`Auth error (attempt ${retryCount + 1}):`, err);
      }
      
      retryCount++;
      if (retryCount < maxRetries) {
        // Wait before retry: 100ms, 200ms, 400ms
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, retryCount - 1)));
      }
    }
    
    if (!user) {
      console.error('Failed to get user after all retries');
      return new Response(JSON.stringify({ error: 'Unauthorized - Session not ready' }), { 
        status: 401, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }

    console.log('User authenticated:', user.id);

    const body = await req.json().catch(() => ({}));
    const userAgent = body.userAgent || req.headers.get('user-agent') || null;
    const ip = body.ip || req.headers.get('x-forwarded-for') || null;

    // Create service role client for database operations
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update last_login using service role
    const { error: updateErr } = await serviceSupabase
      .from('users')
      .update({ last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateErr) {
      console.error('Failed updating last_login', updateErr);
    } else {
      console.log('Updated last_login for user:', user.id);
    }

    // Fetch tenant_id using service role
    const { data: profile, error: profErr } = await serviceSupabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle();

    if (profErr) {
      console.error('Failed fetching user profile:', profErr);
    }

    const tenant_id = profile?.tenant_id || null;
    console.log('User tenant_id:', tenant_id);

    // Insert audit log row using service role
    const { error: auditErr } = await serviceSupabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'login',
        entity_type: 'user',
        entity_id: user.id,
        ip,
        user_agent: userAgent,
        ...(tenant_id ? { tenant_id } : {}),
      });

    if (auditErr) {
      console.error('Failed inserting audit log (login)', auditErr);
    } else {
      console.log('Inserted audit log for user login:', user.id);
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e: any) {
    console.error('log-login error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
