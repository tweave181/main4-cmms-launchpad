import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ArchivedPreset {
  name: string;
  lastUsedDays: number;
  usageCount: number;
  reason: string;
}

interface AutoArchiveNotificationRequest {
  recipientEmail: string;
  recipientName: string;
  archivedPresets: ArchivedPreset[];
  totalArchived: number;
  archivedAt: string;
  autoArchiveSettings: {
    inactivityDays: number;
    usageThreshold: number;
    usageThresholdDays: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      recipientEmail,
      recipientName,
      archivedPresets,
      totalArchived,
      archivedAt,
      autoArchiveSettings,
    }: AutoArchiveNotificationRequest = await req.json();

    console.log(`Sending auto-archive notification to ${recipientEmail}`);

    // Generate preset list HTML
    const presetListHtml = archivedPresets
      .map(
        (preset) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px; font-size: 14px; color: #374151;">
          <strong>${preset.name}</strong>
        </td>
        <td style="padding: 12px; font-size: 14px; color: #6b7280;">
          ${preset.lastUsedDays} days ago
        </td>
        <td style="padding: 12px; font-size: 14px; color: #6b7280;">
          ${preset.usageCount} times
        </td>
        <td style="padding: 12px; font-size: 14px; color: #f59e0b;">
          ${preset.reason}
        </td>
      </tr>
    `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Auto-Archive Summary</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); overflow: hidden;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">
                📦 Auto-Archive Summary
              </h1>
              <p style="margin: 8px 0 0 0; color: #e0e7ff; font-size: 14px;">
                Scheduled auto-archive completed successfully
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #374151;">
                Hi ${recipientName},
              </p>
              
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                Your scheduled auto-archive has run at <strong>${new Date(archivedAt).toLocaleString()}</strong>. 
                ${totalArchived} filter preset${totalArchived !== 1 ? "s" : ""} ${totalArchived !== 1 ? "have" : "has"} been archived based on your configured rules.
              </p>

              <!-- Summary Stats -->
              <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827; font-weight: 600;">
                  Summary
                </h2>
                <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 14px; color: #6b7280;">Total Archived:</span>
                    <span style="font-size: 18px; font-weight: 600; color: #667eea;">${totalArchived}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 14px; color: #6b7280;">Inactivity Threshold:</span>
                    <span style="font-size: 14px; font-weight: 500; color: #374151;">${autoArchiveSettings.inactivityDays} days</span>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 14px; color: #6b7280;">Usage Threshold:</span>
                    <span style="font-size: 14px; font-weight: 500; color: #374151;">&lt; ${autoArchiveSettings.usageThreshold} uses in ${autoArchiveSettings.usageThresholdDays} days</span>
                  </div>
                </div>
              </div>

              <!-- Archived Presets Table -->
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #111827; font-weight: 600;">
                Archived Presets
              </h2>
              <div style="overflow-x: auto; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 24px;">
                <table style="width: 100%; border-collapse: collapse;">
                  <thead>
                    <tr style="background-color: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                      <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">
                        Preset Name
                      </th>
                      <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">
                        Last Used
                      </th>
                      <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">
                        Usage
                      </th>
                      <th style="padding: 12px; text-align: left; font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase;">
                        Reason
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    ${presetListHtml}
                  </tbody>
                </table>
              </div>

              <!-- Actionable Items -->
              <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; border-radius: 4px; margin-bottom: 24px;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #065f46; font-weight: 600;">
                  📋 Recommended Actions
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #047857; font-size: 14px; line-height: 1.8;">
                  <li>Review archived presets to ensure no important filters were removed</li>
                  <li>Restore any presets that are still needed for your workflow</li>
                  <li>Adjust auto-archive rules if too many or too few presets were archived</li>
                  <li>Consider creating new presets for frequently used filter combinations</li>
                  <li>Share useful presets with your team members</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${Deno.env.get("SUPABASE_URL") || "https://your-app.com"}/inventory" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 32px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.2);">
                  View Inventory & Presets
                </a>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                You can manage your auto-archive settings in the Filter Preset Manager within the Inventory page.
              </p>

              <p style="margin: 16px 0 0 0; font-size: 14px; color: #6b7280;">
                Best regards,<br>
                <strong style="color: #374151;">Your Inventory Management Team</strong>
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                This is an automated notification from your inventory management system.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                To stop receiving these notifications, adjust your auto-archive schedule settings.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { data, error } = await resend.emails.send({
      from: "Inventory Management <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `🔔 Auto-Archive Complete: ${totalArchived} Preset${totalArchived !== 1 ? "s" : ""} Archived`,
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending email:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Auto-archive notification sent successfully",
        emailId: data?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-auto-archive-notification function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
