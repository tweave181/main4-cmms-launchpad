import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReusableTabs } from '@/components/ui/reusable-tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, AlertTriangle } from 'lucide-react';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { format } from 'date-fns';

interface AssetMaintenanceTabProps {
  assetId: string;
}

export const AssetMaintenanceTab: React.FC<AssetMaintenanceTabProps> = ({ assetId }) => {
  const { data: workOrders = [], isLoading } = useWorkOrders({ asset_id: assetId });

  const outstandingJobs = workOrders.filter(wo => 
    wo.status === 'open' || wo.status === 'in_progress'
  );

  const completedJobs = workOrders.filter(wo => 
    wo.status === 'completed'
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'secondary';
      case 'in_progress': return 'default';
      case 'completed': return 'outline';
      default: return 'outline';
    }
  };

  const OutstandingJobsList = () => (
    <div className="space-y-4">
      {outstandingJobs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No outstanding maintenance jobs for this asset</p>
        </div>
      ) : (
        outstandingJobs.map((job) => (
          <Card key={job.id} className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-foreground">{job.title}</h4>
                <div className="flex gap-2">
                  <Badge variant={getPriorityColor(job.priority)}>
                    {job.priority}
                  </Badge>
                  <Badge variant={getStatusColor(job.status)}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                {job.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Due: {format(new Date(job.due_date), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                
                {job.assigned_to && job.assigned_user && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Assigned: {job.assigned_user.name}</span>
                  </div>
                )}
                
                {job.estimated_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Est. Hours: {job.estimated_hours}</span>
                  </div>
                )}
              </div>
              
              {job.description && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const CompletedJobsList = () => (
    <div className="space-y-4">
      {completedJobs.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No completed maintenance jobs for this asset</p>
        </div>
      ) : (
        completedJobs.map((job) => (
          <Card key={job.id} className="border border-border">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-medium text-foreground">{job.title}</h4>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  Completed
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                {job.completed_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Completed: {format(new Date(job.completed_at), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                
                {job.assigned_to && job.assigned_user && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Technician: {job.assigned_user.name}</span>
                  </div>
                )}
                
                {job.actual_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Actual Hours: {job.actual_hours}</span>
                  </div>
                )}
              </div>
              
              {job.description && (
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                  {job.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading maintenance jobs...</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <ReusableTabs
        tabs={[
          {
            value: "outstanding",
            label: `Outstanding (${outstandingJobs.length})`,
            content: <OutstandingJobsList />
          },
          {
            value: "completed", 
            label: `Completed (${completedJobs.length})`,
            content: <CompletedJobsList />
          }
        ]}
        defaultValue="outstanding"
      />
    </div>
  );
};