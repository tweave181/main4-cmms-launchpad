
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { SystemAuditLogFilters } from '@/components/system-audit-log/SystemAuditLogFilters';
import { SystemAuditLogTable } from '@/components/system-audit-log/SystemAuditLogTable';
import { useAuth } from '@/contexts/auth';

export interface AuditLogFilters {
  entityTypes: string[];
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

const SystemAuditLog: React.FC = () => {
  const { isAdmin, isSystemAdmin } = useAuth();
  const [filters, setFilters] = useState<AuditLogFilters>({
    entityTypes: isSystemAdmin 
      ? ['Asset Prefix', 'Department', 'Job Title', 'Address']
      : ['Asset Prefix', 'Department', 'Job Title'],
  });

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Access denied. This page is only available to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
            <FileText className="h-6 w-6 text-primary" />
            <span>System Audit Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <SystemAuditLogFilters 
              filters={filters} 
              onFiltersChange={setFilters} 
            />
            <SystemAuditLogTable filters={filters} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemAuditLog;
