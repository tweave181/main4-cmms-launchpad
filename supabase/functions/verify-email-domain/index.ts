import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyDomainRequest {
  email_address: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log("Domain verification request received");

    const { email_address }: VerifyDomainRequest = await req.json();

    const domain = email_address.split("@")[1];
    
    if (!domain) {
      return new Response(
        JSON.stringify({ 
          success: false,
          verified: false,
          error: "Invalid email address format" 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Checking domain verification for: ${domain}`);

    if (domain === "resend.dev") {
      return new Response(JSON.stringify({ 
        success: true,
        verified: true,
        domain: domain,
        message: "Using Resend test domain"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const domainsResponse = await resend.domains.list();
    
    if (!domainsResponse.data) {
      return new Response(
        JSON.stringify({ 
          success: false,
          verified: false,
          error: "Could not fetch domain information" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const domainInfo = domainsResponse.data.data?.find(
      (d: any) => d.name === domain
    );

    if (!domainInfo) {
      return new Response(JSON.stringify({ 
        success: true,
        verified: false,
        domain: domain,
        message: `Domain '${domain}' is not added. Please add and verify it in your email settings.`
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const isVerified = domainInfo.status === "verified";

    return new Response(JSON.stringify({ 
      success: true,
      verified: isVerified,
      domain: domain,
      status: domainInfo.status,
      message: isVerified 
        ? `Domain '${domain}' is verified and ready to use`
        : `Domain '${domain}' is added but not yet verified. Please complete DNS verification.`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error verifying domain:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        verified: false,
        error: "Failed to verify domain"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
