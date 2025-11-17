import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  recipient_email: string;
  from_name: string;
  from_address: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Test email connection request received");

    const { recipient_email, from_name, from_address }: TestEmailRequest = await req.json();

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
