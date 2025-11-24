import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting contract reminder check...');

    const today = new Date().toISOString().split('T')[0];
    
    const { data: contracts, error: contractsError } = await supabase
      .from('service_contracts')
      .select(`
        id,
        contract_title,
        vendor_name,
        end_date,
        reminder_days_before,
        email_reminder_enabled,
        tenant_id,
        tenants!inner(name)
      `)
      .eq('email_reminder_enabled', true)
      .not('reminder_days_before', 'is', null)
      .gte('end_date', today);

    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      throw contractsError;
    }

    if (!contracts || contracts.length === 0) {
      console.log('No contracts with email reminders enabled found');
      return new Response(JSON.stringify({ message: 'No contracts to process' }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    console.log(`Found ${contracts.length} contracts with email reminders enabled`);

    const contractsNeedingReminders = contracts.filter((contract: any) => {
      const endDate = new Date(contract.end_date);
      const reminderDate = new Date(endDate);
      reminderDate.setDate(endDate.getDate() - contract.reminder_days_before);
      
      const reminderDateStr = reminderDate.toISOString().split('T')[0];
      return reminderDateStr === today;
    });

    console.log(`${contractsNeedingReminders.length} contracts need reminders today`);

    for (const contract of contractsNeedingReminders) {
      try {
        const { data: adminUsers, error: usersError } = await supabase
          .from('users')
          .select('id, email, name')
          .eq('tenant_id', contract.tenant_id)
          .eq('role', 'admin');

        if (usersError) {
          console.error(`Error fetching admin users for tenant ${contract.tenant_id}:`, usersError);
          continue;
        }

        if (!adminUsers || adminUsers.length === 0) {
          console.log(`No admin users found for tenant ${contract.tenant_id}`);
          continue;
        }

        const endDate = new Date(contract.end_date);
        const daysUntilExpiry = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        for (const adminUser of adminUsers) {
          console.log(`Sending reminder email to ${adminUser.email} for contract ${contract.contract_title}`);
          
          const emailSubject = `Reminder: ${contract.contract_title} expires in ${daysUntilExpiry} days`;
          const emailHtml = `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h1 style="color: #f59e0b;">⚠️ Contract Expiring Soon</h1>
                  <p>Hi ${adminUser.name},</p>
                  <p>This is a reminder that the following service contract is expiring soon:</p>
                  <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>Contract:</strong> ${contract.contract_title}</p>
                    <p style="margin: 5px 0;"><strong>Vendor:</strong> ${contract.vendor_name}</p>
                    <p style="margin: 5px 0;"><strong>End Date:</strong> ${new Date(contract.end_date).toLocaleDateString()}</p>
                    <p style="margin: 5px 0;"><strong>Days Until Expiry:</strong> ${daysUntilExpiry}</p>
                  </div>
                  <p>Please review this contract and take appropriate action to renew or replace it before it expires.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${supabaseUrl}/admin/service-contracts/${contract.id}" 
                       style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                      View Contract Details
                    </a>
                  </div>
                  <p style="color: #6b7280; font-size: 14px;">
                    This is an automated reminder from your maintenance management system.
                  </p>
                </div>
              </body>
            </html>
          `;

          try {
            await resend.emails.send({
              from: 'Contract Reminders <onboarding@resend.dev>',
              to: [adminUser.email],
              subject: emailSubject,
              html: emailHtml,
            });

            // Log to contract_reminders_log
            await supabase
              .from('contract_reminders_log')
              .insert({
                contract_id: contract.id,
                user_id: adminUser.id,
                delivery_method: 'email',
                delivery_status: 'sent',
                tenant_id: contract.tenant_id,
              });

            // Log to email_delivery_log
            await supabase
              .from('email_delivery_log')
              .insert({
                tenant_id: contract.tenant_id,
                recipient_email: adminUser.email,
                recipient_user_id: adminUser.id,
                subject: emailSubject,
                delivery_status: 'sent',
                sent_at: new Date().toISOString(),
              });

          } catch (emailError) {
            console.error(`Error sending email to ${adminUser.email}:`, emailError);
            
            // Log failed email
            await supabase
              .from('contract_reminders_log')
              .insert({
                contract_id: contract.id,
                user_id: adminUser.id,
                delivery_method: 'email',
                delivery_status: 'failed',
                tenant_id: contract.tenant_id,
              });

            await supabase
              .from('email_delivery_log')
              .insert({
                tenant_id: contract.tenant_id,
                recipient_email: adminUser.email,
                recipient_user_id: adminUser.id,
                subject: emailSubject,
                delivery_status: 'failed',
                error_message: emailError instanceof Error ? emailError.message : 'Unknown error',
              });
          }
        }
      } catch (error) {
        console.error(`Error processing contract ${contract.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${contractsNeedingReminders.length} contract reminders`,
        contractsProcessed: contractsNeedingReminders.length
      }), 
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in contract-reminder-emails function:", error);
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
