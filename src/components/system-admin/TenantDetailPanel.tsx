import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { TenantStats } from '@/hooks/useSystemAdminStats';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Tag, 
  Wrench, 
  MapPin, 
  Package, 
  Calendar, 
  FileText,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface TenantDetailPanelProps {
  tenant: TenantStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TenantDetailPanel = ({ tenant, open, onOpenChange }: TenantDetailPanelProps) => {
  // Fetch tenant users
  const { data: users } = useQuery({
    queryKey: ['tenantUsers', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return [];
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, created_at')
        .eq('tenant_id', tenant.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!tenant?.id && open
  });

  // Fetch setup status details
  const { data: setupStatus } = useQuery({
    queryKey: ['tenantSetupStatus', tenant?.id],
    queryFn: async () => {
      if (!tenant?.id) return null;
      
      const [
        departments,
        categories,
        locationLevels,
        programSettings,
        jobTitles,
        sparePartsCategories
      ] = await Promise.all([
        supabase.from('departments').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
        supabase.from('categories').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
        supabase.from('location_levels').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
        supabase.from('program_settings').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
        supabase.from('job_titles').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id),
        supabase.from('spare_parts_categories').select('id', { count: 'exact', head: true }).eq('tenant_id', tenant.id)
      ]);

      return {
        departments: (departments.count || 0) > 0,
        categories: (categories.count || 0) > 0,
        locationLevels: (locationLevels.count || 0) > 0,
        programSettings: (programSettings.count || 0) > 0,
        jobTitles: (jobTitles.count || 0) > 0,
        sparePartsCategories: (sparePartsCategories.count || 0) > 0
      };
    },
    enabled: !!tenant?.id && open
  });

  if (!tenant) return null;

  const statsItems = [
    { label: 'Users', value: tenant.userCount, icon: Users },
    { label: 'Assets', value: tenant.assetCount, icon: Tag },
    { label: 'Work Orders', value: tenant.workOrderCount, icon: Wrench },
    { label: 'Open WOs', value: tenant.openWorkOrderCount, icon: Wrench },
    { label: 'Locations', value: tenant.locationCount, icon: MapPin },
    { label: 'Inventory', value: tenant.inventoryCount, icon: Package },
    { label: 'PM Schedules', value: tenant.pmScheduleCount, icon: Calendar },
    { label: 'Contracts', value: tenant.contractCount, icon: FileText }
  ];

  const setupItems = [
    { label: 'Departments', configured: setupStatus?.departments },
    { label: 'Categories', configured: setupStatus?.categories },
    { label: 'Location Levels', configured: setupStatus?.locationLevels },
    { label: 'Program Settings', configured: setupStatus?.programSettings },
    { label: 'Job Titles', configured: setupStatus?.jobTitles },
    { label: 'Spare Parts Categories', configured: setupStatus?.sparePartsCategories }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px]">
        <SheetHeader>
          <SheetTitle>{tenant.name}</SheetTitle>
          <SheetDescription>
            Created {format(new Date(tenant.created_at), 'dd MMMM yyyy')}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="stats" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              {statsItems.map((item) => (
                <Card key={item.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-2xl font-bold">{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-4">
            <div className="space-y-3">
              {users?.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No users found</p>
              ) : (
                users?.map((user) => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="setup" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Configuration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {setupItems.map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      {item.configured ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
