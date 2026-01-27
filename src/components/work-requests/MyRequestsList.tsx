import React from 'react';
import { useMyWorkRequests } from '@/hooks/useWorkRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ClipboardList, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { WorkRequestStatus, WorkRequestPriority } from '@/types/workRequest';

const getStatusIcon = (status: WorkRequestStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'approved':
      return <CheckCircle className="h-4 w-4" />;
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    case 'converted':
      return <ArrowRight className="h-4 w-4" />;
    default:
      return null;
  }
};

const getStatusVariant = (status: WorkRequestStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'pending':
      return 'secondary';
    case 'approved':
      return 'default';
    case 'rejected':
      return 'destructive';
    case 'converted':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getPriorityVariant = (priority: WorkRequestPriority): "default" | "secondary" | "destructive" | "outline" => {
  switch (priority) {
    case 'urgent':
      return 'destructive';
    case 'high':
      return 'default';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
};

export const MyRequestsList: React.FC = () => {
  const { data: requests = [], isLoading } = useMyWorkRequests();
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            My Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            You haven't submitted any requests yet.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" />
          My Requests ({requests.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((request) => (
            <div 
              key={request.id} 
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-muted-foreground">
                      {request.request_number}
                    </span>
                    <Badge variant={getStatusVariant(request.status)} className="flex items-center gap-1">
                      {getStatusIcon(request.status)}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                    <Badge variant={getPriorityVariant(request.priority)}>
                      {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                    </Badge>
                  </div>
                  <h4 className="font-medium truncate">{request.title}</h4>
                  <p className="text-sm text-muted-foreground truncate">{request.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{request.category}</span>
                    {request.location?.name && (
                      <span>📍 {request.location.name}</span>
                    )}
                    <span>{format(new Date(request.created_at), 'MMM d, yyyy')}</span>
                  </div>
                  {request.status === 'converted' && request.work_order?.work_order_number && (
                    <p className="text-sm text-primary mt-2">
                      → Converted to Work Order: {request.work_order.work_order_number}
                    </p>
                  )}
                  {request.status === 'rejected' && request.rejection_reason && (
                    <p className="text-sm text-destructive mt-2">
                      Reason: {request.rejection_reason}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
