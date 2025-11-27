import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChecklistRecordForm } from "./ChecklistRecordForm";
import { useCreateChecklistRecord, ChecklistRecordFormData } from "@/hooks/useChecklistRecords";

interface CreateChecklistRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateChecklistRecordModal({
  open,
  onOpenChange,
}: CreateChecklistRecordModalProps) {
  const createRecord = useCreateChecklistRecord();

  const handleSubmit = async (data: ChecklistRecordFormData) => {
    await createRecord.mutateAsync(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Checklist Record</DialogTitle>
          <DialogDescription>
            Create a new checklist record that defines what work should be done.
            You can add checklist lines after creating the record.
          </DialogDescription>
        </DialogHeader>
        <ChecklistRecordForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          submitLabel="Create Record"
        />
      </DialogContent>
    </Dialog>
  );
}
