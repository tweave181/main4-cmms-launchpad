import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle, AlertCircle, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { EmailDeliveryLog } from '@/types/email';

interface EmailLogsTableProps {
  logs: EmailDeliveryLog[];
  onViewDetails: (log: EmailDeliveryLog) => void;
}

export const EmailLogsTable: React.FC<EmailLogsTableProps> = ({ logs, onViewDetails }) => {
  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return (
        <Badge variant="secondary" className="bg-muted">
          <Clock className="h-3 w-3 mr-1" />
          Unknown
        </Badge>
      );
    }

    const statusLower = status.toLowerCase();
    
    if (statusLower === 'delivered' || statusLower === 'opened') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
    }
    
    if (statusLower === 'pending' || statusLower === 'sent') {
      return (
        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
          <Clock className="h-3 w-3 mr-1" />
          {status}
        </Badge>
      );
    }
    
    if (statusLower === 'failed') {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          <XCircle className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        <AlertCircle className="h-3 w-3 mr-1" />
        {status}
      </Badge>
    );
  };

  const getTemplateTypeBadge = (templateType: string | null | undefined) => {
    if (!templateType) return <span className="text-muted-foreground text-sm">—</span>;

    const badgeColors: Record<string, string> = {
      low_stock_alert: 'bg-red-500',
      contract_reminder: 'bg-blue-500',
      maintenance: 'bg-orange-500',
      welcome: 'bg-purple-500',
      password_reset: 'bg-yellow-500',
    };

    const color = badgeColors[templateType] || 'bg-gray-500';
    
    return (
      <Badge className={`${color} text-white`}>
        {templateType.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Recipient</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No email logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm">
                    {new Date(log.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-sm">
                    {log.recipient_name || log.recipient_email}
                  </div>
                  {log.recipient_name && (
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {log.recipient_email}
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <div className="truncate text-sm">{log.subject}</div>
                </TableCell>
                <TableCell>{getStatusBadge(log.delivery_status)}</TableCell>
                <TableCell>{getTemplateTypeBadge(log.template_type)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetails(log)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
