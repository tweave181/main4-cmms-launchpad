import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  Wrench, 
  Edit, 
  Trash2, 
  ArrowLeft, 
  User, 
  MapPin,
  CheckSquare,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { usePMSchedule, useDeletePMSchedule } from '@/hooks/usePreventiveMaintenance';
import { EditPMModal } from '@/components/maintenance/EditPMModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

const PMScheduleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: schedule, isLoading } = usePMSchedule(id!);
  const deleteMutation = useDeletePMSchedule();
  const [editModalOpen, setEditModalOpen] = useState(false);

  const getFrequencyText = (schedule: any) => {
    if (schedule.frequency_type === 'custom') {
      return `Every ${schedule.frequency_value} ${schedule.frequency_unit}`;
    }
    
    if (schedule.frequency_value === 1) {
      return schedule.frequency_type.charAt(0).toUpperCase() + schedule.frequency_type.slice(1);
    }
    
    return `Every ${schedule.frequency_value} ${schedule.frequency_type === 'daily' ? 'days' : 
           schedule.frequency_type === 'weekly' ? 'weeks' : 'months'}`;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (daysUntilDue: number) => {
    if (daysUntilDue < 0) {
      return {
        variant: 'destructive' as const,
        text: `${Math.abs(daysUntilDue)} days overdue`
      };
    }
    if (daysUntilDue <= 14) {
      return {
        variant: 'default' as const,
        text: daysUntilDue === 0 ? 'Due today' : `Due in ${daysUntilDue} days`
      };
    }
    return {
      variant: 'outline' as const,
      text: 'On track'
    };
  };

  const handleDelete = () => {
    deleteMutation.mutate(id!, {
      onSuccess: () => {
        toast({
          title: "Schedule deleted",
          description: "The PM schedule has been deleted successfully.",
        });
        navigate('/maintenance');
      }
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">Schedule not found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The requested PM schedule could not be found.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/maintenance')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Maintenance
          </Button>
        </div>
      </div>
    );
  }

  const daysUntilDue = getDaysUntilDue(schedule.next_due_date);
  const statusBadge = getStatusBadge(daysUntilDue);

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
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold flex items-center space-x-3">
              <Wrench className="h-6 w-6 text-primary" />
              <span>{schedule.name}</span>
              {!schedule.is_active && (
                <Badge variant="secondary">Inactive</Badge>
              )}
            </h1>
            <Badge variant={statusBadge.variant} className="mt-2">
              {statusBadge.text}
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setEditModalOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete PM Schedule</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{schedule.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Next Due Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(schedule.next_due_date), 'EEEE, MMMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Frequency</p>
                    <p className="text-sm text-muted-foreground">
                      {getFrequencyText(schedule)}
                    </p>
                  </div>
                </div>

                {schedule.assigned_user && (
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Assigned To</p>
                      <p className="text-sm text-muted-foreground">
                        {schedule.assigned_user.name}
                      </p>
                    </div>
                  </div>
                )}

                {schedule.last_completed_date && (
                  <div className="flex items-center space-x-3">
                    <CheckSquare className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Completed</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(schedule.last_completed_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {schedule.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground">
                      {schedule.description}
                    </p>
                  </div>
                </>
              )}

              {schedule.instructions && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Instructions</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {schedule.instructions}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Checklist Items */}
          {schedule.checklist_items && schedule.checklist_items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Checklist Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedule.checklist_items.map((item, index) => (
                    <div key={item.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{item.item_text}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          {item.item_type === 'checkbox' ? 'Checkbox' : 'Value Entry'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Assigned Assets */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Assigned Assets ({schedule.assets?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {schedule.assets && schedule.assets.length > 0 ? (
                <div className="space-y-3">
                  {schedule.assets.map((asset) => (
                    <div key={asset.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{asset.name}</p>
                          {asset.asset_tag && (
                            <p className="text-xs text-muted-foreground">
                              Tag: {asset.asset_tag}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No assets assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Status Alert */}
          {daysUntilDue <= 14 && schedule.is_active && (
            <Card className="mt-4">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-medium text-sm">Attention Required</p>
                    <p className="text-xs">
                      {daysUntilDue < 0 
                        ? 'This maintenance is overdue'
                        : 'This maintenance is due soon'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <EditPMModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        scheduleId={schedule.id}
      />
    </div>
  );
};

export default PMScheduleDetail;