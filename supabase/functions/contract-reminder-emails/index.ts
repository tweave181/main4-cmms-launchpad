import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Create service role client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContractReminderEmailData {
  contract_title: string;
  vendor_name: string;
  end_date: string;
  reminder_days_before: number;
  tenant_name: string;
  contract_id: string;
  tenant_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting contract reminder check...');

    // Find contracts that need reminders today
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

    // Filter contracts that need reminders today
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
        // Get admin users for this tenant
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

        // Calculate days until expiry
        const endDate = new Date(contract.end_date);
        const daysUntilExpiry = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        // Send emails to admin users
        for (const adminUser of adminUsers) {
          console.log(`Sending reminder email to ${adminUser.email} for contract ${contract.contract_title}`);
          
          // Here you would integrate with your email service (e.g., Resend)
          // For now, we'll just log the email that would be sent
          const emailData = {
            to: adminUser.email,
            subject: `Reminder: ${contract.contract_title} expires in ${daysUntilExpiry} days`,
            contract_title: contract.contract_title,
            vendor_name: contract.vendor_name,
            end_date: contract.end_date,
            days_until_expiry: daysUntilExpiry,
            recipient_name: adminUser.name,
            tenant_name: contract.tenants.name,
          };

          console.log('Email data:', emailData);

          // Log the reminder
          const { error: logError } = await supabase
            .from('contract_reminders_log')
            .insert({
              contract_id: contract.id,
              user_id: adminUser.id,
              delivery_method: 'email',
              tenant_id: contract.tenant_id,
            });

          if (logError) {
            console.error('Error logging email reminder:', logError);
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