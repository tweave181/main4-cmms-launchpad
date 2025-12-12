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
  isTestSite: boolean;
  userCount: number;
  assetCount: number;
  workOrderCount: number;
  openWorkOrderCount: number;
  locationCount: number;
  inventoryCount: number;
  pmScheduleCount: number;
  contractCount: number;
  hasDefaults: boolean;
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

// Calculate setup progress from tenant stats
const calculateSetupProgress = (tenant: {
  departmentsCount: number;
  categoriesCount: number;
  locationLevelsCount: number;
  jobTitlesCount: number;
  hasSettings: boolean;
  locationCount: number;
  assetCount: number;
  userCount: number;
  checklistItemsCount: number;
  checklistRecordsCount: number;
  pmScheduleCount: number;
  addressesCount: number;
  contractCount: number;
}): SetupProgress => {
  const setupItems = [
    // Foundation (auto-configured)
    tenant.departmentsCount > 0,
    tenant.categoriesCount > 0,
    tenant.locationLevelsCount > 0,
    tenant.jobTitlesCount > 0,
    tenant.hasSettings,
    // Getting Started
    tenant.locationCount > 0,
    tenant.assetCount > 0,
    tenant.userCount > 1, // More than just the admin
    // Advanced Configuration
    tenant.checklistItemsCount > 0,
    tenant.checklistRecordsCount > 0,
    tenant.pmScheduleCount > 0,
    tenant.addressesCount > 0,
    tenant.contractCount > 0
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

  return { completedItems, totalItems, percentComplete, status };
};

export const useSystemAdminStats = () => {
  return useQuery({
    queryKey: ['systemAdminStats'],
    queryFn: async () => {
      // Use SECURITY DEFINER function to get cross-tenant data
      const { data, error } = await supabase.rpc('admin_get_all_tenants_stats');

      if (error) throw error;

      // Transform the data to match our interface
      const tenantStats: TenantStats[] = (data || []).map((tenant: {
        id: string;
        name: string;
        created_at: string;
        is_test_site: boolean;
        user_count: number;
        asset_count: number;
        work_order_count: number;
        open_work_order_count: number;
        location_count: number;
        inventory_count: number;
        pm_schedule_count: number;
        contract_count: number;
        has_defaults: boolean;
        departments_count: number;
        categories_count: number;
        location_levels_count: number;
        job_titles_count: number;
        checklist_items_count: number;
        checklist_records_count: number;
        addresses_count: number;
        has_settings: boolean;
      }) => {
        const stats = {
          departmentsCount: Number(tenant.departments_count),
          categoriesCount: Number(tenant.categories_count),
          locationLevelsCount: Number(tenant.location_levels_count),
          jobTitlesCount: Number(tenant.job_titles_count),
          hasSettings: tenant.has_settings,
          locationCount: Number(tenant.location_count),
          assetCount: Number(tenant.asset_count),
          userCount: Number(tenant.user_count),
          checklistItemsCount: Number(tenant.checklist_items_count),
          checklistRecordsCount: Number(tenant.checklist_records_count),
          pmScheduleCount: Number(tenant.pm_schedule_count),
          addressesCount: Number(tenant.addresses_count),
          contractCount: Number(tenant.contract_count)
        };

        return {
          id: tenant.id,
          name: tenant.name,
          created_at: tenant.created_at,
          isTestSite: tenant.is_test_site,
          userCount: stats.userCount,
          assetCount: stats.assetCount,
          workOrderCount: Number(tenant.work_order_count),
          openWorkOrderCount: Number(tenant.open_work_order_count),
          locationCount: stats.locationCount,
          inventoryCount: Number(tenant.inventory_count),
          pmScheduleCount: stats.pmScheduleCount,
          contractCount: stats.contractCount,
          hasDefaults: tenant.has_defaults,
          departmentsCount: stats.departmentsCount,
          categoriesCount: stats.categoriesCount,
          locationLevelsCount: stats.locationLevelsCount,
          jobTitlesCount: stats.jobTitlesCount,
          checklistItemsCount: stats.checklistItemsCount,
          checklistRecordsCount: stats.checklistRecordsCount,
          addressesCount: stats.addressesCount,
          hasSettings: stats.hasSettings,
          setupProgress: calculateSetupProgress(stats)
        };
      });

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
