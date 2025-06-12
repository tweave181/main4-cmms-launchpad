
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Settings, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
} from '@/components/ui/alert-dialog';
import { usePMSchedules, useDeletePMSchedule } from '@/hooks/usePreventiveMaintenance';
import { Skeleton } from '@/components/ui/skeleton';
import type { PMScheduleWithAssets } from '@/types/preventiveMaintenance';

export const PMScheduleList: React.FC = () => {
  const { data: schedules = [], isLoading } = usePMSchedules();
  const deleteMutation = useDeletePMSchedule();

  const getFrequencyText = (schedule: PMScheduleWithAssets) => {
    if (schedule.frequency_type === 'custom') {
      return `Every ${schedule.frequency_value} ${schedule.frequency_unit}`;
    }
    return `${schedule.frequency_type} (${schedule.frequency_value}x)`;
  };

  const getDueDateBadge = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    } else if (diffDays === 0) {
      return <Badge variant="destructive">Due Today</Badge>;
    } else if (diffDays <= 7) {
      return <Badge className="bg-orange-100 text-orange-800">Due Soon</Badge>;
    }
    return <Badge variant="secondary">Scheduled</Badge>;
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!schedules.length) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No PM Schedules</h3>
        <p className="text-muted-foreground mb-4">
          Create your first preventive maintenance schedule to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Next Due</TableHead>
            <TableHead>Assets</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedules.map((schedule) => (
            <TableRow key={schedule.id}>
              <TableCell className="font-medium">
                <div>
                  <div className="font-medium">{schedule.name}</div>
                  {schedule.description && (
                    <div className="text-sm text-muted-foreground">
                      {schedule.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{getFrequencyText(schedule)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="text-sm">
                    {format(new Date(schedule.next_due_date), 'MMM d, yyyy')}
                  </div>
                  {getDueDateBadge(schedule.next_due_date)}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {schedule.assets?.length || 0} asset{schedule.assets?.length !== 1 ? 's' : ''}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                  {schedule.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
