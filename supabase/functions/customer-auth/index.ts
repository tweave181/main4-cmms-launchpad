import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role key for customer operations (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action } = body;

    if (action === 'login') {
      const { name, password, tenant_id } = body;

      if (!name || !password || !tenant_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Find customer by name and tenant
      const { data: customer, error: findError } = await supabase
        .from('customers')
        .select(`
          *,
          department:departments(name),
          job_title:job_titles(title_name),
          work_area:locations(name),
          supervisor:customers!customers_reports_to_fkey(name)
        `)
        .eq('tenant_id', tenant_id)
        .ilike('name', name)
        .eq('is_active', true)
        .maybeSingle();

      if (findError || !customer) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Verify password
      const passwordValid = await bcrypt.compare(password, customer.password_hash);

      if (!passwordValid) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Remove password_hash from response
      const { password_hash, ...safeCustomer } = customer;

      // Generate simple token (timestamp + customer id)
      const token = btoa(`${customer.id}:${Date.now()}`);

      return new Response(
        JSON.stringify({ success: true, customer: safeCustomer, token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'create') {
      const { tenant_id, name, email, phone, phone_extension, department_id, job_title_id, work_area_id, reports_to, password, is_active } = body;

      if (!tenant_id || !name || !password) {
        return new Response(
          JSON.stringify({ success: false, error: 'Name and password are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      const { data: customer, error } = await supabase
        .from('customers')
        .insert({
          tenant_id,
          name,
          email: email || null,
          phone: phone || null,
          phone_extension: phone_extension || null,
          department_id: department_id || null,
          job_title_id: job_title_id || null,
          work_area_id: work_area_id || null,
          reports_to: reports_to || null,
          password_hash,
          is_active: is_active !== false,
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return new Response(
            JSON.stringify({ success: false, error: 'A customer with this name already exists' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        throw error;
      }

      const { password_hash: _, ...safeCustomer } = customer;

      return new Response(
        JSON.stringify({ success: true, customer: safeCustomer }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update') {
      const { customer_id, name, email, phone, phone_extension, department_id, job_title_id, work_area_id, reports_to, password, is_active } = body;

      if (!customer_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Customer ID is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      const updateData: Record<string, any> = {};

      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email || null;
      if (phone !== undefined) updateData.phone = phone || null;
      if (phone_extension !== undefined) updateData.phone_extension = phone_extension || null;
      if (department_id !== undefined) updateData.department_id = department_id || null;
      if (job_title_id !== undefined) updateData.job_title_id = job_title_id || null;
      if (work_area_id !== undefined) updateData.work_area_id = work_area_id || null;
      if (reports_to !== undefined) updateData.reports_to = reports_to || null;
      if (is_active !== undefined) updateData.is_active = is_active;

      // Hash new password if provided
      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password_hash = await bcrypt.hash(password, salt);
      }

      const { data: customer, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', customer_id)
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return new Response(
            JSON.stringify({ success: false, error: 'A customer with this name already exists' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        throw error;
      }

      const { password_hash: _, ...safeCustomer } = customer;

      return new Response(
        JSON.stringify({ success: true, customer: safeCustomer }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );

  } catch (error) {
    console.error('Customer auth error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
