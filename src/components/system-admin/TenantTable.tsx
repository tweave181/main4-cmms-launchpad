import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TenantStats } from '@/hooks/useSystemAdminStats';
import { Eye, Settings, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface TenantTableProps {
  tenants: TenantStats[];
  isLoading: boolean;
  onViewTenant: (tenant: TenantStats) => void;
  onInitializeTenant: (tenantId: string) => void;
  onToggleTestSite: (tenantId: string, isTestSite: boolean) => void;
  isInitializing: boolean;
}

export const TenantTable = ({
  tenants,
  isLoading,
  onViewTenant,
  onInitializeTenant,
  onToggleTestSite,
  isInitializing
}: TenantTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getSetupBadge = (tenant: TenantStats) => {
    const { status, percentComplete } = tenant.setupProgress;
    
    if (status === 'complete') {
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Complete
        </Badge>
      );
    }
    
    if (status === 'in_progress') {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
          <Clock className="h-3 w-3 mr-1" />
          {percentComplete}%
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Not Started
      </Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-center">Users</TableHead>
            <TableHead className="text-center">Assets</TableHead>
            <TableHead className="text-center">Work Orders</TableHead>
            <TableHead className="text-center">Locations</TableHead>
            <TableHead className="text-center">Setup</TableHead>
            <TableHead className="text-center">Test Site</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenants.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                No tenants found
              </TableCell>
            </TableRow>
          ) : (
            tenants.map((tenant) => (
              <TableRow key={tenant.id}>
                <TableCell className="font-medium">{tenant.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(tenant.created_at), 'dd MMM yyyy')}
                </TableCell>
                <TableCell className="text-center">{tenant.userCount}</TableCell>
                <TableCell className="text-center">{tenant.assetCount}</TableCell>
                <TableCell className="text-center">
                  <span>{tenant.openWorkOrderCount}</span>
                  <span className="text-muted-foreground">/{tenant.workOrderCount}</span>
                </TableCell>
                <TableCell className="text-center">{tenant.locationCount}</TableCell>
                <TableCell className="text-center">
                  {getSetupBadge(tenant)}
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    checked={tenant.isTestSite || false}
                    onCheckedChange={(checked) => onToggleTestSite(tenant.id, checked)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewTenant(tenant)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {!tenant.hasDefaults && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onInitializeTenant(tenant.id)}
                        disabled={isInitializing}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Initialize
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
