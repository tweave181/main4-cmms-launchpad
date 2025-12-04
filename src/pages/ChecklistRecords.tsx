import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FileText, AlertCircle, Clock } from "lucide-react";
import { useChecklistRecords, useDeleteChecklistRecord } from "@/hooks/useChecklistRecords";
import { CreateChecklistRecordModal } from "@/components/checklist-records/CreateChecklistRecordModal";
import { EditChecklistRecordModal } from "@/components/checklist-records/EditChecklistRecordModal";
import { ViewChecklistRecordModal } from "@/components/checklist-records/ViewChecklistRecordModal";
import { formatWorkingDays } from "@/components/checklist-records/DayOfWeekSelector";

const WORK_TIMING_SHORT: Record<string, string> = {
  in_hours: "In Hours",
  out_of_hours: "Out of Hours",
  at_night: "Night",
  weekend: "Weekend",
};
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

export default function ChecklistRecords() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [viewingRecord, setViewingRecord] = useState<string | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<string | null>(null);

  const { data: records, isLoading } = useChecklistRecords();
  const deleteRecord = useDeleteChecklistRecord();

  const handleDelete = async () => {
    if (deletingRecord) {
      await deleteRecord.mutateAsync(deletingRecord);
      setDeletingRecord(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading checklist records...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Checklist Records</h1>
            <p className="text-muted-foreground">
              Manage checklist records that define what work should be done for different maintenance schedules
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Record
          </Button>
        </div>

        {!records || records.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Checklist Records</h3>
              <p className="text-muted-foreground text-center mb-4">
                Get started by creating your first checklist record. These define what work needs to be done for your maintenance schedules.
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Record
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {records.map((record) => (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{record.name}</CardTitle>
                      {record.description && (
                        <CardDescription className="mt-1">{record.description}</CardDescription>
                      )}
                    </div>
                    {!record.is_active && (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {record.asset_type && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Asset Type:</span>
                        <Badge variant="outline">{record.asset_type}</Badge>
                      </div>
                    )}
                    {record.frequency_type && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Frequency:</span>
                        <Badge variant="outline">{record.frequency_type}</Badge>
                      </div>
                    )}
                    {record.work_timing && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{WORK_TIMING_SHORT[record.work_timing] || record.work_timing}</span>
                        {(record.frequency_type?.toLowerCase() === "daily" || record.frequency_type?.toLowerCase() === "weekly") && record.working_days && (
                          <span className="text-xs text-muted-foreground">• {formatWorkingDays(record.working_days)}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingRecord(record.id)}
                        className="flex-1"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRecord(record.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeletingRecord(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateChecklistRecordModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      {editingRecord && (
        <EditChecklistRecordModal
          recordId={editingRecord}
          open={!!editingRecord}
          onOpenChange={(open) => !open && setEditingRecord(null)}
        />
      )}

      {viewingRecord && (
        <ViewChecklistRecordModal
          recordId={viewingRecord}
          open={!!viewingRecord}
          onOpenChange={(open) => !open && setViewingRecord(null)}
        />
      )}

      <AlertDialog open={!!deletingRecord} onOpenChange={(open) => !open && setDeletingRecord(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Checklist Record
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this checklist record? This action cannot be undone.
              Any maintenance schedules using this record will need to be updated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
