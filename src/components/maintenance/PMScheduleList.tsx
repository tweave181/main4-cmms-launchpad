
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, Wrench, Edit, Trash2, AlertTriangle, User } from 'lucide-react';
import { format } from 'date-fns';
import { usePMSchedules, useDeletePMSchedule } from '@/hooks/usePreventiveMaintenance';
import { EditPMModal } from './EditPMModal';
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
import type { PMScheduleWithAssets } from '@/types/preventiveMaintenance';

export const PMScheduleList: React.FC = () => {
  const { data: schedules = [], isLoading } = usePMSchedules();
  const deleteMutation = useDeletePMSchedule();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>('');

  const getFrequencyText = (schedule: PMScheduleWithAssets) => {
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

  const getDueBadgeColor = (daysUntilDue: number) => {
    if (daysUntilDue < 0) return 'destructive';
    if (daysUntilDue <= 3) return 'default';
    if (daysUntilDue <= 7) return 'secondary';
    return 'outline';
  };

  const handleEdit = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
    setEditModalOpen(true);
  };

  const handleDelete = (scheduleId: string) => {
    deleteMutation.mutate(scheduleId);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!schedules.length) {
    return (
      <div className="text-center py-12">
        <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-2 text-sm font-medium text-foreground">No PM schedules</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating your first preventive maintenance schedule.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {schedules.map((schedule) => {
          const daysUntilDue = getDaysUntilDue(schedule.next_due_date);
          const badgeColor = getDueBadgeColor(daysUntilDue);
          
          return (
            <Card key={schedule.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Wrench className="h-5 w-5 text-primary" />
                    <span>{schedule.name}</span>
                    {!schedule.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant={badgeColor}>
                      {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` :
                       daysUntilDue === 0 ? 'Due today' :
                       `Due in ${daysUntilDue} days`}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEdit(schedule.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
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
                            onClick={() => handleDelete(schedule.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4" />
                      <span>Next Due: {format(new Date(schedule.next_due_date), 'MMM dd, yyyy')}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      <span>Frequency: {getFrequencyText(schedule)}</span>
                    </div>
                    {schedule.assigned_user && (
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>Assigned: {schedule.assigned_user.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Assets ({schedule.assets?.length || 0})</p>
                    <div className="flex flex-wrap gap-1">
                      {schedule.assets?.slice(0, 3).map((asset) => (
                        <Badge key={asset.id} variant="outline" className="text-xs">
                          {asset.name}
                        </Badge>
                      ))}
                      {(schedule.assets?.length || 0) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(schedule.assets?.length || 0) - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    {schedule.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {schedule.description}
                      </p>
                    )}
                    {schedule.checklist_items && schedule.checklist_items.length > 0 && (
                      <p className="text-xs text-muted-foreground mb-2">
                        Checklist: {schedule.checklist_items.length} items
                      </p>
                    )}
                    {daysUntilDue <= 3 && schedule.is_active && (
                      <div className="flex items-center space-x-1 text-orange-600 text-xs">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Maintenance due soon</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedScheduleId && (
        <EditPMModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          scheduleId={selectedScheduleId}
        />
      )}
    </>
  );
};
