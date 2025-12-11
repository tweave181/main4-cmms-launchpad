import { format } from 'date-fns';
import { TenantStats } from '@/hooks/useSystemAdminStats';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
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
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Tag, 
  Wrench, 
  MapPin, 
  Package, 
  Calendar, 
  FileText,
  CheckCircle,
  XCircle,
  Building2,
  Layers,
  Settings,
  Rocket,
  ClipboardList,
  BookOpen,
  UserPlus
} from 'lucide-react';

interface TenantDetailPanelProps {
  tenant: TenantStats | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SetupItem {
  label: string;
  completed: boolean;
  count?: number;
  countLabel?: string;
}

interface SetupSection {
  title: string;
  icon: React.ElementType;
  items: SetupItem[];
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

  // Build setup sections matching tenant setup wizard
  const setupSections: SetupSection[] = [
    {
      title: 'Foundation (Auto-configured)',
      icon: Building2,
      items: [
        { 
          label: 'Departments', 
          completed: tenant.departmentsCount > 0, 
          count: tenant.departmentsCount,
          countLabel: 'configured'
        },
        { 
          label: 'Asset Categories', 
          completed: tenant.categoriesCount > 0, 
          count: tenant.categoriesCount,
          countLabel: 'configured'
        },
        { 
          label: 'Location Levels', 
          completed: tenant.locationLevelsCount > 0, 
          count: tenant.locationLevelsCount,
          countLabel: 'configured'
        },
        { 
          label: 'Job Titles', 
          completed: tenant.jobTitlesCount > 0, 
          count: tenant.jobTitlesCount,
          countLabel: 'configured'
        },
        { 
          label: 'Program Settings', 
          completed: tenant.hasSettings,
          countLabel: tenant.hasSettings ? 'Configured' : 'Not configured'
        },
      ]
    },
    {
      title: 'Getting Started',
      icon: Rocket,
      items: [
        { 
          label: 'First Location', 
          completed: tenant.locationCount > 0, 
          count: tenant.locationCount,
          countLabel: 'created'
        },
        { 
          label: 'First Asset', 
          completed: tenant.assetCount > 0, 
          count: tenant.assetCount,
          countLabel: 'created'
        },
        { 
          label: 'Team Members', 
          completed: tenant.userCount > 1, 
          count: tenant.userCount,
          countLabel: tenant.userCount > 1 ? 'users' : 'user (invite more)'
        },
      ]
    },
    {
      title: 'Advanced Configuration (Optional)',
      icon: Settings,
      items: [
        { 
          label: 'Checklist Items', 
          completed: tenant.checklistItemsCount > 0, 
          count: tenant.checklistItemsCount,
          countLabel: tenant.checklistItemsCount > 0 ? 'created' : 'Not started'
        },
        { 
          label: 'Checklist Records', 
          completed: tenant.checklistRecordsCount > 0, 
          count: tenant.checklistRecordsCount,
          countLabel: tenant.checklistRecordsCount > 0 ? 'created' : 'Not started'
        },
        { 
          label: 'PM Schedules', 
          completed: tenant.pmScheduleCount > 0, 
          count: tenant.pmScheduleCount,
          countLabel: tenant.pmScheduleCount > 0 ? 'created' : 'Not started'
        },
        { 
          label: 'Address Book', 
          completed: tenant.addressesCount > 0, 
          count: tenant.addressesCount,
          countLabel: tenant.addressesCount > 0 ? 'entries' : 'Not started'
        },
        { 
          label: 'Service Contracts', 
          completed: tenant.contractCount > 0, 
          count: tenant.contractCount,
          countLabel: tenant.contractCount > 0 ? 'created' : 'Not started'
        },
      ]
    }
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:max-w-[500px] overflow-y-auto">
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

          <TabsContent value="setup" className="mt-4 space-y-4">
            {/* Progress Overview */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Setup Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {tenant.setupProgress.completedItems}/{tenant.setupProgress.totalItems} items
                  </span>
                </div>
                <Progress value={tenant.setupProgress.percentComplete} className="h-2" />
                <p className="text-xs text-muted-foreground mt-2">
                  {tenant.setupProgress.percentComplete}% Complete
                </p>
              </CardContent>
            </Card>

            {/* Setup Sections */}
            {setupSections.map((section) => (
              <Card key={section.title}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <section.icon className="h-4 w-4 text-muted-foreground" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          {item.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className={`text-sm ${item.completed ? '' : 'text-muted-foreground'}`}>
                            {item.label}
                          </span>
                        </div>
                        <span className={`text-xs ${item.completed ? 'text-muted-foreground' : 'text-muted-foreground/60'}`}>
                          {item.count !== undefined && item.count > 0 ? `${item.count} ${item.countLabel}` : item.countLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
