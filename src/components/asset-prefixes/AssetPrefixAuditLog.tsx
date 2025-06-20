
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { format } from 'date-fns';
import { Clock, User, Edit, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface AuditLogEntry {
  id: string;
  action: 'created' | 'updated' | 'deleted';
  changed_by: string;
  change_summary: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
  };
}

export const AssetPrefixAuditLog: React.FC = () => {
  const { userProfile } = useAuth();

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ['assetPrefixAuditLogs', userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
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
        .eq('tenant_id', userProfile?.tenant_id)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;

      return data.map((entry: any) => ({
        id: entry.id,
        action: entry.action,
        changed_by: entry.changed_by,
        change_summary: entry.change_summary,
        timestamp: entry.timestamp,
        user: entry.users
      }));
    },
    enabled: !!userProfile?.tenant_id,
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'updated':
        return <Edit className="h-4 w-4 text-blue-600" />;
      case 'deleted':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Audit Log</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Audit Log</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No audit logs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {auditLogs.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(entry.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge className={getActionColor(entry.action)}>
                        {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">
                      {entry.change_summary}
                    </p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{entry.user?.name || 'Unknown User'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
