import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Test database configuration
const SUPABASE_TEST_URL = process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_TEST_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'test-key';

export const supabaseTest = createClient<Database>(
  SUPABASE_TEST_URL,
  SUPABASE_TEST_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Test user credentials
export const TEST_USER = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User',
};

// Test tenant data
export const TEST_TENANT = {
  name: 'Test Tenant',
  slug: 'test-tenant',
};

// Helper to create test user and tenant
export async function setupTestUser() {
  try {
    // Sign up test user
    const { data: authData, error: authError } = await supabaseTest.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
      options: {
        data: {
          name: TEST_USER.name,
          tenant_name: TEST_TENANT.name,
          role: 'admin',
        },
      },
    });

    if (authError) throw authError;

    return authData;
  } catch (error) {
    console.error('Failed to setup test user:', error);
    throw error;
  }
}

// Helper to sign in test user
export async function signInTestUser() {
  const { data, error } = await supabaseTest.auth.signInWithPassword({
    email: TEST_USER.email,
    password: TEST_USER.password,
  });

  if (error) throw error;
  return data;
}

// Helper to clean up test user
export async function cleanupTestUser() {
  try {
    await supabaseTest.auth.signOut();
  } catch (error) {
    console.error('Failed to cleanup test user:', error);
  }
}

// Helper to get current tenant ID
export async function getCurrentTenantId(): Promise<string | null> {
  const { data: { session } } = await supabaseTest.auth.getSession();
  return session?.user?.user_metadata?.tenant_id || null;
}

// Helper to create test asset
export async function createTestAsset(data: Partial<Database['public']['Tables']['assets']['Insert']>) {
  const tenantId = await getCurrentTenantId();
  if (!tenantId) throw new Error('No tenant ID found');

  const { data: asset, error } = await supabaseTest
    .from('assets')
    .insert({
      name: 'Test Asset',
      status: 'active',
      priority: 'medium',
      asset_type: 'unit',
      tenant_id: tenantId,
      ...data,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return asset;
}

// Helper to clean up test assets
export async function cleanupTestAssets() {
  const tenantId = await getCurrentTenantId();
  if (!tenantId) return;

  await supabaseTest
    .from('assets')
    .delete()
    .eq('tenant_id', tenantId);
}

// Helper to create test department
export async function createTestDepartment(name: string = 'Test Department') {
  const tenantId = await getCurrentTenantId();
  if (!tenantId) throw new Error('No tenant ID found');

  const { data: department, error } = await supabaseTest
    .from('departments')
    .insert({
      name,
      tenant_id: tenantId,
    })
    .select()
    .maybeSingle();

  if (error) throw error;
  return department;
}

// Helper to clean up test departments
export async function cleanupTestDepartments() {
  const tenantId = await getCurrentTenantId();
  if (!tenantId) return;

  await supabaseTest
    .from('departments')
    .delete()
    .eq('tenant_id', tenantId);
}

// Global setup for integration tests
export async function globalSetup() {
  console.log('Setting up integration tests...');
  try {
    await setupTestUser();
    await signInTestUser();
  } catch (error) {
    console.error('Global setup failed:', error);
  }
}

// Global teardown for integration tests
export async function globalTeardown() {
  console.log('Tearing down integration tests...');
  try {
    await cleanupTestAssets();
    await cleanupTestDepartments();
    await cleanupTestUser();
  } catch (error) {
    console.error('Global teardown failed:', error);
  }
}
