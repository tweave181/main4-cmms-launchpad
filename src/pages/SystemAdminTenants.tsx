import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { useSimpleSystemAdminCheck } from '@/hooks/useSimpleSystemAdminCheck';
import { useSystemAdminStats, useInitializeTenantDefaults, TenantStats } from '@/hooks/useSystemAdminStats';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TenantOverviewCards } from '@/components/system-admin/TenantOverviewCards';
import { TenantTable } from '@/components/system-admin/TenantTable';
import { TenantDetailPanel } from '@/components/system-admin/TenantDetailPanel';
import InvitationManagement from '@/components/system-admin/InvitationManagement';
import { Shield } from 'lucide-react';

const SystemAdminTenants = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isSystemAdmin, isLoading: isCheckingAdmin } = useSimpleSystemAdminCheck(user);
  const { data, isLoading } = useSystemAdminStats();
  const { initializeDefaults } = useInitializeTenantDefaults();
  const queryClient = useQueryClient();
  
  const [selectedTenant, setSelectedTenant] = useState<TenantStats | null>(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Redirect non-system-admins
  if (!isCheckingAdmin && !isSystemAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">You need system administrator privileges to access this page.</p>
      </div>
    );
  }

  const handleViewTenant = (tenant: TenantStats) => {
    setSelectedTenant(tenant);
    setDetailPanelOpen(true);
  };

  const handleInitializeTenant = async (tenantId: string) => {
    setIsInitializing(true);
    try {
      await initializeDefaults(tenantId);
      toast.success('Tenant defaults initialized successfully');
      queryClient.invalidateQueries({ queryKey: ['systemAdminStats'] });
    } catch (error) {
      console.error('Failed to initialize tenant:', error);
      toast.error('Failed to initialize tenant defaults');
    } finally {
      setIsInitializing(false);
    }
  };

  if (isCheckingAdmin) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Administration</h1>
        <p className="text-muted-foreground">Manage all tenants and platform-wide settings</p>
      </div>

      <TenantOverviewCards 
        stats={data?.platformStats} 
        isLoading={isLoading} 
      />

      <InvitationManagement />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tenants</h2>
        <TenantTable
          tenants={data?.tenantStats || []}
          isLoading={isLoading}
          onViewTenant={handleViewTenant}
          onInitializeTenant={handleInitializeTenant}
          isInitializing={isInitializing}
        />
      </div>

      <TenantDetailPanel
        tenant={selectedTenant}
        open={detailPanelOpen}
        onOpenChange={setDetailPanelOpen}
      />
    </div>
  );
};

export default SystemAdminTenants;
