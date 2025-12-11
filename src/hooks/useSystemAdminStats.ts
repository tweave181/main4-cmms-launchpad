import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SetupProgress {
  completedItems: number;
  totalItems: number;
  percentComplete: number;
  status: 'not_started' | 'in_progress' | 'complete';
}

export interface TenantStats {
  id: string;
  name: string;
  created_at: string;
  userCount: number;
  assetCount: number;
  workOrderCount: number;
  openWorkOrderCount: number;
  locationCount: number;
  inventoryCount: number;
  pmScheduleCount: number;
  contractCount: number;
  hasDefaults: boolean;
  // Additional counts for setup status
  departmentsCount: number;
  categoriesCount: number;
  locationLevelsCount: number;
  jobTitlesCount: number;
  checklistItemsCount: number;
  checklistRecordsCount: number;
  addressesCount: number;
  hasSettings: boolean;
  setupProgress: SetupProgress;
}

export interface PlatformStats {
  totalTenants: number;
  totalUsers: number;
  totalAssets: number;
  totalWorkOrders: number;
}

export const useSystemAdminStats = () => {
  return useQuery({
    queryKey: ['systemAdminStats'],
    queryFn: async () => {
      // Fetch all tenants
      const { data: tenants, error: tenantsError } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (tenantsError) throw tenantsError;

      // Fetch counts for each tenant
      const tenantStats: TenantStats[] = await Promise.all(
        (tenants || []).map(async (tenant) => {
          const [
            usersResult,
            assetsResult,
            workOrdersResult,
            openWorkOrdersResult,
            locationsResult,
            inventoryResult,
            pmSchedulesResult,
            contractsResult,
            hasDefaultsResult,
            departmentsResult,
            categoriesResult,
            locationLevelsResult,
            jobTitlesResult,
            checklistItemsResult,
            checklistRecordsResult,
            addressesResult,
            settingsResult
          ] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('assets').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('work_orders').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('work_orders').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id).in('status', ['Open', 'In Progress']),
            supabase.from('locations').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('inventory_parts').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('preventive_maintenance_schedules').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('service_contracts').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.rpc('tenant_has_defaults', { p_tenant_id: tenant.id }),
            supabase.from('departments').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('categories').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('location_levels').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('job_titles').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('checklist_item_templates').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('checklist_records').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('addresses').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('program_settings').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id)
          ]);

          // Calculate setup progress
          const departmentsCount = departmentsResult.count || 0;
          const categoriesCount = categoriesResult.count || 0;
          const locationLevelsCount = locationLevelsResult.count || 0;
          const jobTitlesCount = jobTitlesResult.count || 0;
          const locationCount = locationsResult.count || 0;
          const assetCount = assetsResult.count || 0;
          const userCount = usersResult.count || 0;
          const checklistItemsCount = checklistItemsResult.count || 0;
          const checklistRecordsCount = checklistRecordsResult.count || 0;
          const pmScheduleCount = pmSchedulesResult.count || 0;
          const addressesCount = addressesResult.count || 0;
          const contractCount = contractsResult.count || 0;
          const hasSettings = (settingsResult.count || 0) > 0;

          // Setup items checklist (matching tenant setup wizard)
          const setupItems = [
            // Foundation (auto-configured)
            departmentsCount > 0,
            categoriesCount > 0,
            locationLevelsCount > 0,
            jobTitlesCount > 0,
            hasSettings,
            // Getting Started
            locationCount > 0,
            assetCount > 0,
            userCount > 1, // More than just the admin
            // Advanced Configuration
            checklistItemsCount > 0,
            checklistRecordsCount > 0,
            pmScheduleCount > 0,
            addressesCount > 0,
            contractCount > 0
          ];

          const completedItems = setupItems.filter(Boolean).length;
          const totalItems = setupItems.length;
          const percentComplete = Math.round((completedItems / totalItems) * 100);
          
          let status: SetupProgress['status'] = 'not_started';
          if (completedItems === totalItems) {
            status = 'complete';
          } else if (completedItems > 0) {
            status = 'in_progress';
          }

          return {
            id: tenant.id,
            name: tenant.name,
            created_at: tenant.created_at,
            userCount,
            assetCount,
            workOrderCount: workOrdersResult.count || 0,
            openWorkOrderCount: openWorkOrdersResult.count || 0,
            locationCount,
            inventoryCount: inventoryResult.count || 0,
            pmScheduleCount,
            contractCount,
            hasDefaults: hasDefaultsResult.data || false,
            departmentsCount,
            categoriesCount,
            locationLevelsCount,
            jobTitlesCount,
            checklistItemsCount,
            checklistRecordsCount,
            addressesCount,
            hasSettings,
            setupProgress: {
              completedItems,
              totalItems,
              percentComplete,
              status
            }
          };
        })
      );

      // Calculate platform totals
      const platformStats: PlatformStats = {
        totalTenants: tenantStats.length,
        totalUsers: tenantStats.reduce((acc, t) => acc + t.userCount, 0),
        totalAssets: tenantStats.reduce((acc, t) => acc + t.assetCount, 0),
        totalWorkOrders: tenantStats.reduce((acc, t) => acc + t.workOrderCount, 0)
      };

      return { tenantStats, platformStats };
    }
  });
};

export const useInitializeTenantDefaults = () => {
  const initializeDefaults = async (tenantId: string) => {
    const { error } = await supabase.rpc('initialize_tenant_defaults', { p_tenant_id: tenantId });
    if (error) throw error;
    return true;
  };

  return { initializeDefaults };
};
