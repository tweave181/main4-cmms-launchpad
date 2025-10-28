import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Edit, Trash2, User } from 'lucide-react';
import { useTimeRecords, useDeleteTimeRecord } from '@/hooks/useTimeRecords';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import { useAuth } from '@/contexts/auth';
import { EditTimeRecordModal } from './EditTimeRecordModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { TimeRecord } from '@/types/timeRecord';

interface TimeRecordsListProps {
  workOrderId?: string;
  pmScheduleId?: string;
  maintenanceJobId?: string;
  showUserColumn?: boolean;
}

export const TimeRecordsList: React.FC<TimeRecordsListProps> = ({
  workOrderId,
  pmScheduleId,
  maintenanceJobId,
  showUserColumn = true,
}) => {
  const { formatDate } = useGlobalSettings();
  const { userProfile } = useAuth();
  const { data: timeRecords = [], isLoading } = useTimeRecords({
    work_order_id: workOrderId,
    pm_schedule_id: pmScheduleId,
    maintenance_job_id: maintenanceJobId,
  });
  const deleteMutation = useDeleteTimeRecord();
  
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);

  const isAdmin = userProfile?.role === 'admin';
  const canEdit = (record: TimeRecord) => {
    const recordDate = new Date(record.work_date);
    const daysSince = Math.floor((Date.now() - recordDate.getTime()) / (1000 * 60 * 60 * 24));
    return record.user_id === userProfile?.id && daysSince <= 7;
  };

  // Calculate totals
  const totalHours = timeRecords.reduce((sum, record) => sum + record.hours_worked, 0);

  // Group by user
  const recordsByUser = timeRecords.reduce((acc, record) => {
    const userName = record.user?.name || 'Unknown User';
    if (!acc[userName]) {
      acc[userName] = [];
    }
    acc[userName].push(record);
    return acc;
  }, {} as Record<string, TimeRecord[]>);

  const handleDelete = async () => {
    if (deletingRecordId) {
      await deleteMutation.mutateAsync(deletingRecordId);
      setDeletingRecordId(null);
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading time records...</div>;
  }

  if (timeRecords.length === 0) {
    return (
      <Card className="rounded-2xl">
        <CardContent className="py-8 text-center text-muted-foreground">
          No time records logged yet
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Time Records</span>
            </CardTitle>
            <Badge variant="secondary">
              Total: {totalHours.toFixed(2)} hours
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {showUserColumn ? (
            // Grouped by user view
            <div className="space-y-6">
              {Object.entries(recordsByUser).map(([userName, records]) => {
                const userTotal = records.reduce((sum, r) => sum + r.hours_worked, 0);
                return (
                  <div key={userName}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{userName}</span>
                      </div>
                      <Badge variant="outline">{userTotal.toFixed(2)} hours</Badge>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Hours</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {records.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatDate(record.work_date)}</TableCell>
                            <TableCell>{record.hours_worked}h</TableCell>
                            <TableCell>
                              {record.start_time && record.end_time ? (
                                <span className="text-xs text-muted-foreground">
                                  {record.start_time} - {record.end_time}
                                </span>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell>
                              {record.work_type ? (
                                <Badge variant="outline" className="capitalize">
                                  {record.work_type}
                                </Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {record.description}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {(canEdit(record) || isAdmin) && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingRecord(record)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeletingRecordId(record.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })}
            </div>
          ) : (
            // Simple list view (no user grouping)
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.work_date)}</TableCell>
                    <TableCell>{record.hours_worked}h</TableCell>
                    <TableCell>
                      {record.start_time && record.end_time ? (
                        <span className="text-xs text-muted-foreground">
                          {record.start_time} - {record.end_time}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {record.work_type ? (
                        <Badge variant="outline" className="capitalize">
                          {record.work_type}
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {record.description}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {(canEdit(record) || isAdmin) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingRecord(record)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingRecordId(record.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {editingRecord && (
        <EditTimeRecordModal
          timeRecord={editingRecord}
          open={!!editingRecord}
          onOpenChange={(open) => !open && setEditingRecord(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingRecordId} onOpenChange={(open) => !open && setDeletingRecordId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Time Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this time record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
