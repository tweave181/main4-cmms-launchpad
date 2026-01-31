import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Web Crypto API-based password hashing (compatible with Edge Runtime)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  
  // Generate a random salt (16 bytes)
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Import the password as a key
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  
  // Derive a key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    256
  );
  
  // Convert to Uint8Array
  const hashArray = new Uint8Array(derivedBits);
  
  // Combine salt and hash, then encode as base64
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);
  
  return btoa(String.fromCharCode(...combined));
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    
    // Decode the stored hash
    const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));
    
    // Extract salt (first 16 bytes) and hash
    const salt = combined.slice(0, 16);
    const storedHashBytes = combined.slice(16);
    
    // Import the password as a key
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    
    // Derive the key using the same parameters
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      256
    );
    
    const hashArray = new Uint8Array(derivedBits);
    
    // Compare the hashes
    if (hashArray.length !== storedHashBytes.length) return false;
    
    let result = 0;
    for (let i = 0; i < hashArray.length; i++) {
      result |= hashArray[i] ^ storedHashBytes[i];
    }
    
    return result === 0;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

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
          work_area:locations(name)
        `)
        .eq('tenant_id', tenant_id)
        .ilike('name', name)
        .eq('is_active', true)
        .maybeSingle();

      console.log('Login attempt for:', { name, tenant_id, customerFound: !!customer, findError });

      if (findError || !customer) {
        console.log('Customer not found or query error:', findError);
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Check if email is verified
      if (!customer.email_verified) {
        console.log('Customer email not verified:', customer.email);
        return new Response(
          JSON.stringify({ success: false, error: 'Please verify your email before logging in' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Verify password using Web Crypto API
      const passwordValid = await verifyPassword(password, customer.password_hash);
      console.log('Password verification result:', passwordValid);

      if (!passwordValid) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid credentials' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }

      // Remove password_hash from response
      const { password_hash, verification_token, verification_token_expires_at, ...safeCustomer } = customer;

      // Generate simple token (timestamp + customer id)
      const token = btoa(`${customer.id}:${Date.now()}`);

      return new Response(
        JSON.stringify({ success: true, customer: safeCustomer, token }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'signup') {
      const { tenant_id, name, email, password } = body;

      if (!tenant_id || !name || !email || !password) {
        return new Response(
          JSON.stringify({ success: false, error: 'Name, email and password are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid email format' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Check if customer with same name or email already exists
      const { data: existing } = await supabase
        .from('customers')
        .select('id, name, email')
        .eq('tenant_id', tenant_id)
        .or(`name.ilike.${name},email.ilike.${email}`)
        .maybeSingle();

      if (existing) {
        const errorMsg = existing.email?.toLowerCase() === email.toLowerCase() 
          ? 'An account with this email already exists'
          : 'An account with this name already exists';
        return new Response(
          JSON.stringify({ success: false, error: errorMsg }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Hash password using Web Crypto API
      const password_hash = await hashPassword(password);

      // Generate verification token
      const verification_token = crypto.randomUUID();
      const verification_token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

      // Create customer
      const { data: customer, error: createError } = await supabase
        .from('customers')
        .insert({
          tenant_id,
          name,
          email,
          password_hash,
          verification_token,
          verification_token_expires_at,
          email_verified: false,
          is_active: true,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating customer:', createError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create account' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Send verification email
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        
        // Get the origin for the verification URL
        const origin = req.headers.get('origin') || 'https://id-preview--4f5e6a65-aa71-4ffa-b277-e29dddd42aab.lovable.app';
        const verificationUrl = `${origin}/verify-customer-email?token=${verification_token}`;

        try {
          await resend.emails.send({
            from: 'Main4 <noreply@main4.uk>',
            to: [email],
            subject: 'Verify your email - Customer Portal',
            html: `
              <h1>Welcome to the Customer Portal!</h1>
              <p>Hi ${name},</p>
              <p>Thank you for signing up. Please verify your email address by clicking the link below:</p>
              <p><a href="${verificationUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a></p>
              <p>Or copy and paste this link into your browser:</p>
              <p>${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create this account, you can safely ignore this email.</p>
            `,
          });
          console.log('Verification email sent to:', email);
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
          // Don't fail the signup if email fails - they can request a resend
        }
      } else {
        console.warn('RESEND_API_KEY not configured, skipping verification email');
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Account created. Please check your email to verify your account.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'verify_email') {
      const { token } = body;

      if (!token) {
        return new Response(
          JSON.stringify({ success: false, error: 'Verification token is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Find customer by verification token
      const { data: customer, error: findError } = await supabase
        .from('customers')
        .select('id, email_verified, verification_token_expires_at')
        .eq('verification_token', token)
        .maybeSingle();

      if (findError || !customer) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid verification token' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Check if already verified
      if (customer.email_verified) {
        return new Response(
          JSON.stringify({ success: true, message: 'Email already verified' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if token has expired
      if (new Date(customer.verification_token_expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ success: false, error: 'Verification token has expired. Please request a new one.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Verify the email
      const { error: updateError } = await supabase
        .from('customers')
        .update({
          email_verified: true,
          verification_token: null,
          verification_token_expires_at: null,
        })
        .eq('id', customer.id);

      if (updateError) {
        console.error('Error verifying email:', updateError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to verify email' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Email verified successfully. You can now log in.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'resend_verification') {
      const { email, tenant_id } = body;

      if (!email || !tenant_id) {
        return new Response(
          JSON.stringify({ success: false, error: 'Email and tenant are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Find customer
      const { data: customer, error: findError } = await supabase
        .from('customers')
        .select('id, name, email_verified')
        .eq('tenant_id', tenant_id)
        .ilike('email', email)
        .maybeSingle();

      if (findError || !customer) {
        // Don't reveal whether account exists
        return new Response(
          JSON.stringify({ success: true, message: 'If an account exists with this email, a verification link will be sent.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (customer.email_verified) {
        return new Response(
          JSON.stringify({ success: false, error: 'Email is already verified' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Generate new verification token
      const verification_token = crypto.randomUUID();
      const verification_token_expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      await supabase
        .from('customers')
        .update({ verification_token, verification_token_expires_at })
        .eq('id', customer.id);

      // Send verification email
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey) {
        const resend = new Resend(resendApiKey);
        const origin = req.headers.get('origin') || 'https://id-preview--4f5e6a65-aa71-4ffa-b277-e29dddd42aab.lovable.app';
        const verificationUrl = `${origin}/verify-customer-email?token=${verification_token}`;

        try {
          await resend.emails.send({
            from: 'Main4 <noreply@main4.uk>',
            to: [email],
            subject: 'Verify your email - Customer Portal',
            html: `
              <h1>Verify Your Email</h1>
              <p>Hi ${customer.name},</p>
              <p>Please verify your email address by clicking the link below:</p>
              <p><a href="${verificationUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email</a></p>
              <p>Or copy and paste this link into your browser:</p>
              <p>${verificationUrl}</p>
              <p>This link will expire in 24 hours.</p>
            `,
          });
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Verification email sent' }),
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

      // Hash password using Web Crypto API
      const password_hash = await hashPassword(password);

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
          email_verified: true, // Admin-created accounts are pre-verified
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

      const { password_hash: _, verification_token, verification_token_expires_at, ...safeCustomer } = customer;

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

      // Hash new password if provided using Web Crypto API
      if (password) {
        updateData.password_hash = await hashPassword(password);
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

      const { password_hash: _, verification_token, verification_token_expires_at, ...safeCustomer } = customer;

      return new Response(
        JSON.stringify({ success: true, customer: safeCustomer }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get_tenant_by_subdomain') {
      const { subdomain } = body;

      if (!subdomain) {
        return new Response(
          JSON.stringify({ success: false, error: 'Subdomain is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Find tenant by subdomain (only return id and name for privacy until login)
      const { data: tenant, error: findError } = await supabase
        .from('tenants')
        .select('id, name, subdomain')
        .eq('subdomain', subdomain.toLowerCase())
        .maybeSingle();

      if (findError || !tenant) {
        return new Response(
          JSON.stringify({ success: false, error: 'Organization not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, tenant }),
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
