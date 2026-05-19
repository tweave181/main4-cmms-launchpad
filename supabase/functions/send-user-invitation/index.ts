import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationEmailRequest {
  invitationId: string;
  name: string;
  email: string;
  role: string;
  inviterName: string;
  tenantName: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: callerProfile, error: callerError } = await adminClient
      .from('users').select('role, tenant_id').eq('id', user.id).single();
    if (callerError || callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden: admin access required' }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json();
    const invitationId = body?.invitationId;
    const inviterName = body?.inviterName || 'A team administrator';
    if (!invitationId) {
      throw new Error('Missing required field: invitationId');
    }

    const { data: invitation, error: invError } = await adminClient
      .from('user_invitations')
      .select('id, tenant_id, email, name, role, invitation_code, token')
      .eq('id', invitationId).single();
    if (invError || !invitation) {
      return new Response(JSON.stringify({ error: 'Invitation not found' }), {
        status: 404, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (invitation.tenant_id !== callerProfile.tenant_id) {
      return new Response(JSON.stringify({ error: 'Forbidden: tenant mismatch' }), {
        status: 403, headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: tenantRow } = await adminClient
      .from('tenants').select('name').eq('id', invitation.tenant_id).single();

    const email = invitation.email;
    const name = invitation.name || '';
    const role = invitation.role;
    const token = (invitation as any).token || invitation.invitation_code;
    const tenantName = tenantRow?.name || 'your organization';

    if (!email || !token) {
      throw new Error("Invitation missing email or token");
    }

    const baseUrl = req.headers.get("origin") || "https://id-preview--4f5e6a65-aa71-4ffa-b277-e29dddd42aab.lovable.app";
    const inviteLink = `${baseUrl}/accept-invitation?token=${token}`;

    console.log("Sending invitation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "Main4 <noreply@main4.uk>",
      to: [email],
      subject: `You've been invited to join ${tenantName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">You're Invited!</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
            <p style="font-size: 16px; margin-bottom: 20px;">Hi ${name || 'there'},</p>
            
            <p style="font-size: 16px; margin-bottom: 20px;">
              <strong>${inviterName || 'A team administrator'}</strong> has invited you to join <strong>${tenantName}</strong> as a <strong>${role}</strong>.
            </p>
            
            <p style="font-size: 16px; margin-bottom: 25px;">
              Click the button below to accept your invitation and set up your account:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 14px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: 600; 
                        font-size: 16px;
                        display: inline-block;">
                Accept Invitation
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 25px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">
              ${inviteLink}
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
            
            <p style="font-size: 12px; color: #9ca3af; text-align: center;">
              This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, ...emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-user-invitation function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
