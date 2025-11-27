import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChecklistRecordForm } from "./ChecklistRecordForm";
import {
  useChecklistRecord,
  useUpdateChecklistRecord,
  ChecklistRecordFormData,
} from "@/hooks/useChecklistRecords";

interface EditChecklistRecordModalProps {
  recordId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditChecklistRecordModal({
  recordId,
  open,
  onOpenChange,
}: EditChecklistRecordModalProps) {
  const { data: record, isLoading } = useChecklistRecord(recordId);
  const updateRecord = useUpdateChecklistRecord();

  const handleSubmit = async (data: ChecklistRecordFormData) => {
    await updateRecord.mutateAsync({ id: recordId, data });
    onOpenChange(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Checklist Record</DialogTitle>
          <DialogDescription>
            Update the details of this checklist record.
          </DialogDescription>
        </DialogHeader>
        <ChecklistRecordForm
          initialData={record}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Update Record"
        />
      </DialogContent>
    </Dialog>
  );
}
