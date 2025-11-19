import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

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
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Domain verification request received");

    const { email_address }: VerifyDomainRequest = await req.json();

    // Extract domain from email address
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

    // Check if using Resend's test domain
    if (domain === "resend.dev") {
      return new Response(JSON.stringify({ 
        success: true,
        verified: true,
        domain: domain,
        message: "Using Resend test domain"
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Fetch domain details from Resend
    const domainsResponse = await resend.domains.list();
    
    console.log("Domains response:", domainsResponse);

    if (!domainsResponse.data) {
      return new Response(
        JSON.stringify({ 
          success: false,
          verified: false,
          error: "Could not fetch domain information from Resend" 
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Find the domain in the list
    const domainInfo = domainsResponse.data.data?.find(
      (d: any) => d.name === domain
    );

    if (!domainInfo) {
      return new Response(JSON.stringify({ 
        success: true,
        verified: false,
        domain: domain,
        message: `Domain '${domain}' is not added to your Resend account. Please add and verify it in your Resend dashboard.`
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Check verification status
    const isVerified = domainInfo.status === "verified";

    return new Response(JSON.stringify({ 
      success: true,
      verified: isVerified,
      domain: domain,
      status: domainInfo.status,
      message: isVerified 
        ? `Domain '${domain}' is verified and ready to use`
        : `Domain '${domain}' is added but not yet verified. Please complete DNS verification in your Resend dashboard.`
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error verifying domain:", error);
    
    let errorMessage = "Failed to verify domain";
    if (error.message) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        verified: false,
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
