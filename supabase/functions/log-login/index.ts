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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization') || '' },
      },
    });

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const body = await req.json().catch(() => ({}));
    const userAgent = body.userAgent || req.headers.get('user-agent') || null;
    const ip = body.ip || req.headers.get('x-forwarded-for') || null;

    // Update last_login
    const { error: updateErr } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateErr) {
      console.error('Failed updating last_login', updateErr);
    }

    // Fetch tenant_id
    const { data: profile, error: profErr } = await supabase
      .from('users')
      .select('tenant_id')
      .eq('id', user.id)
      .maybeSingle();

    const tenant_id = profile?.tenant_id || null;

    // Insert audit log row
    const { error: auditErr } = await supabase
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
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  } catch (e: any) {
    console.error('log-login error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
});
