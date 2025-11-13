import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LowStockAlertRequest {
  part_id: string;
  part_name: string;
  sku: string;
  current_stock: number;
  reorder_threshold: number;
  unit_of_measure: string;
  category?: string;
  supplier_name?: string;
  supplier_email?: string;
  tenant_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: LowStockAlertRequest = await req.json();
    console.log('Low stock alert triggered for part:', requestData.part_name);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get notification recipients (admins and inventory managers)
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('email, name')
      .eq('tenant_id', requestData.tenant_id)
      .eq('role', 'admin')
      .not('email', 'is', null);

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw usersError;
    }

    if (!users || users.length === 0) {
      console.log('No admin users found to notify');
      return new Response(
        JSON.stringify({ message: 'No recipients found' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipientEmails = users.map(u => u.email).filter(Boolean) as string[];
    console.log(`Sending low stock alert to ${recipientEmails.length} recipients`);

    // Calculate stock deficit
    const deficit = requestData.reorder_threshold - requestData.current_stock;
    const percentageLow = Math.round((requestData.current_stock / requestData.reorder_threshold) * 100);
    const severityColor = percentageLow < 50 ? '#ef4444' : percentageLow < 80 ? '#f97316' : '#eab308';

    // Generate email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Low Stock Alert</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Low Stock Alert</h1>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <div style="background: #fef2f2; border-left: 4px solid ${severityColor}; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
              <p style="margin: 0; font-weight: 600; color: #991b1b;">
                <strong>${requestData.part_name}</strong> has reached its reorder threshold and needs replenishing.
              </p>
            </div>

            <h2 style="color: #374151; font-size: 20px; margin-top: 0;">Part Details</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">Part Name:</td>
                <td style="padding: 12px 0; text-align: right;">${requestData.part_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">SKU:</td>
                <td style="padding: 12px 0; text-align: right;">${requestData.sku}</td>
              </tr>
              ${requestData.category ? `
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">Category:</td>
                <td style="padding: 12px 0; text-align: right;">${requestData.category}</td>
              </tr>
              ` : ''}
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">Current Stock:</td>
                <td style="padding: 12px 0; text-align: right; color: ${severityColor}; font-weight: 600;">
                  ${requestData.current_stock} ${requestData.unit_of_measure}
                </td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">Reorder Threshold:</td>
                <td style="padding: 12px 0; text-align: right;">${requestData.reorder_threshold} ${requestData.unit_of_measure}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; font-weight: 600; color: #6b7280;">Stock Deficit:</td>
                <td style="padding: 12px 0; text-align: right; color: #dc2626; font-weight: 600;">
                  ${deficit} ${requestData.unit_of_measure}
                </td>
              </tr>
            </table>

            ${requestData.supplier_name ? `
            <h3 style="color: #374151; font-size: 18px; margin-bottom: 15px;">Supplier Information</h3>
            <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
              <p style="margin: 0 0 8px 0;"><strong>Supplier:</strong> ${requestData.supplier_name}</p>
              ${requestData.supplier_email ? `<p style="margin: 0;"><strong>Email:</strong> ${requestData.supplier_email}</p>` : ''}
            </div>
            ` : ''}

            <div style="background: #f0f9ff; border: 1px solid #bfdbfe; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
              <p style="margin: 0; color: #1e40af;">
                <strong>📋 Recommended Action:</strong> Reorder at least ${deficit + Math.ceil(requestData.reorder_threshold * 0.5)} ${requestData.unit_of_measure} to restore healthy stock levels.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://mzpweuuvyuaawpttoqkn.supabase.co" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                View Part Details
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p style="margin: 0;">This is an automated alert from your inventory management system.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to all recipients
    const emailPromises = recipientEmails.map(email => 
      resend.emails.send({
        from: 'Inventory Alerts <onboarding@resend.dev>',
        to: [email],
        subject: `Low Stock Alert: ${requestData.part_name} - Reorder Required`,
        html: emailHtml,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    console.log(`Email results: ${successCount} sent, ${failureCount} failed`);

    // Log failures
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Failed to send email to ${recipientEmails[index]}:`, result.reason);
      }
    });

    return new Response(
      JSON.stringify({ 
        message: 'Low stock alerts processed',
        sent: successCount,
        failed: failureCount,
        recipients: recipientEmails
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in send-low-stock-alert function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

serve(handler);
