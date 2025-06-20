
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  action: string;
  change_summary: string;
  timestamp: string;
  changed_by: string;
  user_name?: string;
}

export const JobTitleAuditLog: React.FC = () => {
  const { userProfile } = useAuth();

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['job-title-audit-log', userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('job_title_audit_log')
        .select(`
          id,
          action,
          change_summary,
          timestamp,
          changed_by,
          users!inner(name)
        `)
        .eq('tenant_id', userProfile?.tenant_id)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      return data.map(entry => ({
        id: entry.id,
        action: entry.action,
        change_summary: entry.change_summary,
        timestamp: entry.timestamp,
        changed_by: entry.changed_by,
        user_name: entry.users?.name
      })) as AuditLogEntry[];
    },
    enabled: !!userProfile?.tenant_id,
  });

  if (isLoading) {
    return (
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Recent Changes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Recent Changes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {auditLogs && auditLogs.length > 0 ? (
            <div className="space-y-4">
              {auditLogs.map((entry) => (
                <div key={entry.id} className="border-l-2 border-primary pl-4 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      entry.action === 'created' ? 'bg-green-100 text-green-700' :
                      entry.action === 'updated' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {entry.action}
                    </span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(entry.timestamp), 'MMM dd, HH:mm')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{entry.change_summary}</p>
                  <p className="text-xs text-gray-500">by {entry.user_name || 'Unknown User'}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent changes</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
