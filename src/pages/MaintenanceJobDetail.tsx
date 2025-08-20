import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock, User, ExternalLink, Building, Settings } from 'lucide-react';
import { useMaintenanceJob, useUpdateMaintenanceJob } from '@/hooks/useMaintenanceJobs';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

const MaintenanceJobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { data: job, isLoading } = useMaintenanceJob(jobId!);
  const updateMutation = useUpdateMaintenanceJob();

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
      case 'overdue': return 'destructive';
      case 'completed': return 'outline';
      case 'closed': return 'outline';
      default: return 'outline';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (!job) return;
    
    const updates: any = { status: newStatus };
    
    if (newStatus === 'completed' || newStatus === 'closed') {
      updates.completed_at = new Date().toISOString();
    }

    updateMutation.mutate({ jobId: job.id, updates });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground">Maintenance job not found</h3>
          <p className="text-muted-foreground mt-2">The requested maintenance job could not be found.</p>
          <Button 
            onClick={() => navigate('/maintenance')} 
            className="mt-4"
          >
            Back to Maintenance
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/maintenance')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Maintenance
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{job.name}</h1>
            <p className="text-muted-foreground">Maintenance Job Details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant={getPriorityColor(job.priority)}>
            {job.priority}
          </Badge>
          <Badge variant={getStatusColor(job.status)}>
            {job.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Job Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{job.description}</p>
                </div>
              )}
              
              {job.instructions && (
                <div>
                  <h4 className="font-medium mb-2">Instructions</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{job.instructions}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Due Date:</span>
                  <span>{format(new Date(job.due_date), 'MMM dd, yyyy')}</span>
                </div>
                
                {job.completed_at && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Completed:</span>
                    <span>{format(new Date(job.completed_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Asset Information */}
          {job.asset && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="h-5 w-5" />
                  <span>Asset Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{job.asset.name}</h4>
                    {job.asset.asset_tag && (
                      <p className="text-sm text-muted-foreground">Tag: {job.asset.asset_tag}</p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/assets/${job.asset?.id}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Asset
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Work Order Link */}
          {job.work_order && (
            <Card>
              <CardHeader>
                <CardTitle>Related Work Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Work Order #{job.work_order.work_order_number}</p>
                    <p className="text-sm text-muted-foreground">View the related work order for more details</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/work-orders/${job.work_order?.id}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Work Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.status === 'open' && (
                <Button 
                  className="w-full"
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={updateMutation.isPending}
                >
                  Start Job
                </Button>
              )}
              
              {job.status === 'in_progress' && (
                <Button 
                  className="w-full"
                  onClick={() => handleStatusChange('completed')}
                  disabled={updateMutation.isPending}
                >
                  Mark Complete
                </Button>
              )}
              
              {(job.status === 'open' || job.status === 'in_progress') && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleStatusChange('closed')}
                  disabled={updateMutation.isPending}
                >
                  Close Job
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Assignment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {job.assigned_user ? (
                <div>
                  <p className="font-medium">{job.assigned_user.name}</p>
                  <p className="text-sm text-muted-foreground">{job.assigned_user.email}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Unassigned</p>
              )}
            </CardContent>
          </Card>

          {/* Schedule Information */}
          {job.pm_schedule && (
            <Card>
              <CardHeader>
                <CardTitle>PM Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="font-medium">{job.pm_schedule.name}</p>
                  <p className="text-sm text-muted-foreground">This job was generated from a PM schedule</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceJobDetail;