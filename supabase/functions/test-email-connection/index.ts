import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  recipient_email: string;
  from_name: string;
  from_address: string;
  tenant_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Authentication check
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  // Verify the user's JWT
  const token = authHeader.replace('Bearer ', '');
  const { data: userData, error: userError } = await authClient.auth.getUser(token);
  
  if (userError || !userData?.user) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get user's tenant_id and role from the users table
  const { data: userProfile, error: profileError } = await authClient
    .from('users')
    .select('tenant_id, role')
    .eq('id', userData.user.id)
    .single();

  if (profileError || !userProfile) {
    return new Response(
      JSON.stringify({ error: 'User profile not found' }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Only admins can test email connections
  if (userProfile.role !== 'admin') {
    return new Response(
      JSON.stringify({ error: 'Forbidden: admin access required' }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("Test email connection request received");

    const { recipient_email, from_name, from_address, tenant_id }: TestEmailRequest = await req.json();

    // Verify the request tenant_id matches the authenticated user's tenant
    if (tenant_id !== userProfile.tenant_id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden: tenant mismatch' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending test email to: ${recipient_email}, from: ${from_name} <${from_address}>`);

    const emailResponse = await resend.emails.send({
      from: `${from_name} <${from_address}>`,
      to: [recipient_email],
      subject: "🧪 Test Email - Email Configuration",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">✅ Email Service Test Successful</h1>
          <p>This is a test email from your maintenance management system.</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Sender:</strong> ${from_name}</p>
            <p style="margin: 5px 0;"><strong>From Address:</strong> ${from_address}</p>
            <p style="margin: 5px 0;"><strong>Sent:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p>Your email service is configured correctly and working as expected.</p>
          <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
            If you received this email, your email configuration is functioning properly.
          </p>
        </div>
      `,
    });

    console.log("Test email sent successfully:", emailResponse);

    // Log to email_delivery_log
    const { error: logError } = await supabase
      .from('email_delivery_log')
      .insert({
        tenant_id: tenant_id,
        recipient_email: recipient_email,
        subject: "🧪 Test Email - Email Configuration",
        delivery_status: 'sent',
        sent_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Error logging email:', logError);
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Test email sent successfully",
      email_id: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending test email:", error);
    
    let errorMessage = "Failed to send test email";
    if (error.message) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ 
        success: false,
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
