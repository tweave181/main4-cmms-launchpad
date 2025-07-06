
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Clock, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { AuditLogFilters } from '@/pages/SystemAuditLog';

interface UnifiedAuditLog {
  id: string;
  entityType: string;
  action: 'created' | 'updated' | 'deleted';
  changedBy: string;
  changeSummary: string;
  timestamp: string;
  userName: string;
  userEmail: string;
}

interface SystemAuditLogTableProps {
  filters: AuditLogFilters;
}

export const SystemAuditLogTable: React.FC<SystemAuditLogTableProps> = ({ filters }) => {
  const { userProfile } = useAuth();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['systemAuditLogs', userProfile?.tenant_id, filters],
    queryFn: async () => {
      if (!userProfile?.tenant_id) return [];

      const logs: UnifiedAuditLog[] = [];

      // Fetch Asset Prefix logs
      if (filters.entityTypes.includes('Asset Prefix')) {
        const { data: assetPrefixLogs, error: assetPrefixError } = await supabase
          .from('asset_tag_prefix_audit_log')
          .select(`
            id,
            action,
            changed_by,
            change_summary,
            timestamp,
            users!changed_by (
              name,
              email
            )
          `)
          .eq('tenant_id', userProfile.tenant_id)
          .order('timestamp', { ascending: false });

        if (assetPrefixError) throw assetPrefixError;

        assetPrefixLogs?.forEach((log: any) => {
          logs.push({
            id: `asset_prefix_${log.id}`,
            entityType: 'Asset Prefix',
            action: log.action,
            changedBy: log.changed_by,
            changeSummary: log.change_summary,
            timestamp: log.timestamp,
            userName: log.users?.name || 'Unknown User',
            userEmail: log.users?.email || '',
          });
        });
      }

      // Fetch Department logs
      if (filters.entityTypes.includes('Department')) {
        const { data: departmentLogs, error: departmentError } = await supabase
          .from('department_audit_log')
          .select(`
            id,
            action,
            changed_by,
            change_summary,
            timestamp,
            users!changed_by (
              name,
              email
            )
          `)
          .eq('tenant_id', userProfile.tenant_id)
          .order('timestamp', { ascending: false });

        if (departmentError) throw departmentError;

        departmentLogs?.forEach((log: any) => {
          logs.push({
            id: `department_${log.id}`,
            entityType: 'Department',
            action: log.action,
            changedBy: log.changed_by,
            changeSummary: log.change_summary,
            timestamp: log.timestamp,
            userName: log.users?.name || 'Unknown User',
            userEmail: log.users?.email || '',
          });
        });
      }

      // Fetch Job Title logs
      if (filters.entityTypes.includes('Job Title')) {
        const { data: jobTitleLogs, error: jobTitleError } = await supabase
          .from('job_title_audit_log')
          .select(`
            id,
            action,
            changed_by,
            change_summary,
            timestamp,
            users!changed_by (
              name,
              email
            )
          `)
          .eq('tenant_id', userProfile.tenant_id)
          .order('timestamp', { ascending: false });

        if (jobTitleError) throw jobTitleError;

        jobTitleLogs?.forEach((log: any) => {
          logs.push({
            id: `job_title_${log.id}`,
            entityType: 'Job Title',
            action: log.action,
            changedBy: log.changed_by,
            changeSummary: log.change_summary,
            timestamp: log.timestamp,
            userName: log.users?.name || 'Unknown User',
            userEmail: log.users?.email || '',
          });
        });
      }

      // Fetch Address logs
      if (filters.entityTypes.includes('Address')) {
        const { data: addressLogs, error: addressError } = await supabase
          .from('address_audit_log')
          .select(`
            id,
            action,
            changed_by,
            change_summary,
            timestamp,
            users!changed_by (
              name,
              email
            )
          `)
          .eq('tenant_id', userProfile.tenant_id)
          .order('timestamp', { ascending: false });

        if (addressError) throw addressError;

        addressLogs?.forEach((log: any) => {
          logs.push({
            id: `address_${log.id}`,
            entityType: 'Address',
            action: log.action,
            changedBy: log.changed_by,
            changeSummary: log.change_summary,
            timestamp: log.timestamp,
            userName: log.users?.name || 'Unknown User',
            userEmail: log.users?.email || '',
          });
        });
      }

      // Apply filters
      let filteredLogs = logs;

      if (filters.userId) {
        filteredLogs = filteredLogs.filter(log => log.changedBy === filters.userId);
      }

      if (filters.startDate) {
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= filters.startDate!
        );
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= endDate
        );
      }

      // Sort by timestamp (newest first)
      return filteredLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    },
    enabled: !!userProfile?.tenant_id,
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800';
      case 'updated':
        return 'bg-blue-100 text-blue-800';
      case 'deleted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'Asset Prefix':
        return 'bg-purple-100 text-purple-800';
      case 'Department':
        return 'bg-orange-100 text-orange-800';
      case 'Job Title':
        return 'bg-teal-100 text-teal-800';
      case 'Address':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleRowExpansion = (logId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(logId)) {
      newExpandedRows.delete(logId);
    } else {
      newExpandedRows.add(logId);
    }
    setExpandedRows(newExpandedRows);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {auditLogs.length} audit log{auditLogs.length !== 1 ? 's' : ''} found
        </p>
      </div>

      <ScrollArea className="h-96 w-full rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Entity Type</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Changed By</TableHead>
              <TableHead>Summary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No audit logs found</p>
                </TableCell>
              </TableRow>
            ) : (
              auditLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <TableRow className="hover:bg-gray-50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleRowExpansion(log.id)}
                        className="h-6 w-6 p-0"
                      >
                        {expandedRows.has(log.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.timestamp), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>
                      <Badge className={getEntityTypeColor(log.entityType)}>
                        {log.entityType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{log.userName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="truncate">{log.changeSummary}</p>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(log.id) && (
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell colSpan={5}>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">User Details</p>
                              <p className="text-sm text-gray-600">{log.userEmail}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">Full Summary</p>
                              <p className="text-sm text-gray-600">{log.changeSummary}</p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
