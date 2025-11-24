import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import { useRecentEmailActivity } from '@/hooks/useRecentEmailActivity';
import { useAuth } from '@/contexts/auth';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const RecentEmailActivity: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: emailLogs, isLoading, error } = useRecentEmailActivity();

  // Only render for admin users
  if (!isAdmin) return null;

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
    if (!templateType) return null;

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
    <Card className="rounded-2xl shadow-sm border border-border">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
            <Mail className="h-6 w-6 text-primary" />
            <span>Recent Email Activity</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/email-logs')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 border border-border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-destructive" />
            <p>Failed to load email activity</p>
          </div>
        ) : !emailLogs || emailLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-3" />
            <p>No emails sent yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {emailLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {log.recipient_name || log.recipient_email}
                      </p>
                      {log.recipient_name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {log.recipient_email}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-foreground mb-2 line-clamp-1">
                    {log.subject}
                  </p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {getStatusBadge(log.delivery_status)}
                    {getTemplateTypeBadge(log.template_type)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
