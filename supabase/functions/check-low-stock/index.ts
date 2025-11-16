import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LowStockPart {
  id: string;
  name: string;
  sku: string;
  quantity_in_stock: number;
  reorder_threshold: number;
  unit_of_measure: string;
  category: string | null;
  last_alert_sent_at: string | null;
  tenant_id: string;
  supplier_id: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting low stock check...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all parts that are below reorder threshold
    const { data: lowStockParts, error: partsError } = await supabase
      .from('inventory_parts')
      .select('id, name, sku, quantity_in_stock, reorder_threshold, unit_of_measure, category, last_alert_sent_at, tenant_id, supplier_id')
      .lte('quantity_in_stock', supabase.rpc('reorder_threshold'))
      .order('tenant_id');

    if (partsError) {
      console.error('Error fetching low stock parts:', partsError);
      throw partsError;
    }

    if (!lowStockParts || lowStockParts.length === 0) {
      console.log('No low stock parts found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No low stock parts found',
          alerts_sent: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Found ${lowStockParts.length} low stock parts`);

    // Filter parts that need alerts (no alert sent in last 24 hours)
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const partsNeedingAlerts = lowStockParts.filter((part: LowStockPart) => {
      if (!part.last_alert_sent_at) {
        return true; // Never sent an alert
      }
      const lastAlertDate = new Date(part.last_alert_sent_at);
      return lastAlertDate < twentyFourHoursAgo; // Alert was sent more than 24 hours ago
    });

    console.log(`${partsNeedingAlerts.length} parts need alerts (filtered by 24-hour cooldown)`);

    if (partsNeedingAlerts.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All low stock parts have recent alerts',
          alerts_sent: 0,
          low_stock_count: lowStockParts.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get supplier information for parts that have suppliers
    const partIds = partsNeedingAlerts.map((p: LowStockPart) => p.id);
    const supplierIds = [...new Set(partsNeedingAlerts.map((p: LowStockPart) => p.supplier_id).filter(Boolean))];
    
    let supplierMap = new Map();
    if (supplierIds.length > 0) {
      const { data: suppliers } = await supabase
        .from('addresses')
        .select('id, contact_name, email')
        .in('id', supplierIds);
      
      if (suppliers) {
        suppliers.forEach(supplier => {
          supplierMap.set(supplier.id, supplier);
        });
      }
    }

    // Send alerts for each part
    let successCount = 0;
    let failureCount = 0;

    for (const part of partsNeedingAlerts) {
      try {
        console.log(`Sending alert for part: ${part.name} (SKU: ${part.sku})`);

        const supplier = part.supplier_id ? supplierMap.get(part.supplier_id) : null;

        // Invoke the send-low-stock-alert function
        const { data, error } = await supabase.functions.invoke('send-low-stock-alert', {
          body: {
            part_id: part.id,
            part_name: part.name,
            sku: part.sku,
            current_stock: part.quantity_in_stock,
            reorder_threshold: part.reorder_threshold,
            unit_of_measure: part.unit_of_measure,
            category: part.category,
            supplier_name: supplier?.contact_name || null,
            supplier_email: supplier?.email || null,
            tenant_id: part.tenant_id,
          },
        });

        if (error) {
          console.error(`Failed to send alert for part ${part.sku}:`, error);
          failureCount++;
          continue;
        }

        // Update last_alert_sent_at
        const { error: updateError } = await supabase
          .from('inventory_parts')
          .update({ last_alert_sent_at: now.toISOString() })
          .eq('id', part.id);

        if (updateError) {
          console.error(`Failed to update last_alert_sent_at for part ${part.sku}:`, updateError);
        }

        successCount++;
        console.log(`Successfully sent alert for part: ${part.name}`);
      } catch (error) {
        console.error(`Error processing part ${part.sku}:`, error);
        failureCount++;
      }
    }

    console.log(`Low stock check complete. Success: ${successCount}, Failures: ${failureCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Low stock check completed',
        alerts_sent: successCount,
        alerts_failed: failureCount,
        total_low_stock: lowStockParts.length,
        parts_checked: partsNeedingAlerts.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error in check-low-stock function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

serve(handler);
