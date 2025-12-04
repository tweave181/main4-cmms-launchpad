import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
            hasDefaultsResult
          ] = await Promise.all([
            supabase.from('users').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('assets').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('work_orders').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('work_orders').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id).in('status', ['Open', 'In Progress']),
            supabase.from('locations').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('inventory_parts').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('preventive_maintenance_schedules').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.from('service_contracts').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
            supabase.rpc('tenant_has_defaults', { p_tenant_id: tenant.id })
          ]);

          return {
            id: tenant.id,
            name: tenant.name,
            created_at: tenant.created_at,
            userCount: usersResult.count || 0,
            assetCount: assetsResult.count || 0,
            workOrderCount: workOrdersResult.count || 0,
            openWorkOrderCount: openWorkOrdersResult.count || 0,
            locationCount: locationsResult.count || 0,
            inventoryCount: inventoryResult.count || 0,
            pmScheduleCount: pmSchedulesResult.count || 0,
            contractCount: contractsResult.count || 0,
            hasDefaults: hasDefaultsResult.data || false
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
