import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, AlertTriangle } from "lucide-react";
import {
  useChecklistRecord,
  useChecklistRecordLines,
  useAddLinesToRecord,
  useRemoveLineFromRecord,
} from "@/hooks/useChecklistRecords";
import { SelectChecklistFromLibrary } from "@/components/maintenance/SelectChecklistFromLibrary";

interface ViewChecklistRecordModalProps {
  recordId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewChecklistRecordModal({
  recordId,
  open,
  onOpenChange,
}: ViewChecklistRecordModalProps) {
  const [showAddLines, setShowAddLines] = useState(false);
  const { data: record, isLoading: recordLoading } = useChecklistRecord(recordId);
  const { data: lines, isLoading: linesLoading } = useChecklistRecordLines(recordId);
  const addLines = useAddLinesToRecord();
  const removeLine = useRemoveLineFromRecord();

  const handleAddLines = async (templates: any[]) => {
    const lineIds = templates.map(t => t.id);
    await addLines.mutateAsync({ recordId, lineIds });
    setShowAddLines(false);
  };

  const handleRemoveLine = async (lineId: string) => {
    await removeLine.mutateAsync({ recordId, lineId });
  };

  if (recordLoading || linesLoading) {
    return null;
  }

  const existingLineIds = lines?.map(l => l.checklist_line_id) || [];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {record?.name}
              {!record?.is_active && <Badge variant="secondary">Inactive</Badge>}
            </DialogTitle>
            {record?.description && (
              <DialogDescription>{record.description}</DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-y-auto">
            {record?.asset_type && (
              <div>
                <span className="text-sm font-medium">Asset Type:</span>{" "}
                <Badge variant="outline">{record.asset_type}</Badge>
              </div>
            )}
            {record?.frequency_type && (
              <div>
                <span className="text-sm font-medium">Frequency:</span>{" "}
                <Badge variant="outline">{record.frequency_type}</Badge>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Checklist Lines</h4>
                <Button onClick={() => setShowAddLines(true)} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Lines
                </Button>
              </div>

              {!lines || lines.length === 0 ? (
                <Card className="p-6 text-center text-muted-foreground">
                  No checklist lines added yet. Click "Add Lines" to get started.
                </Card>
              ) : (
                <div className="space-y-2">
                  {lines.map((line) => (
                    <Card key={line.id} className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {line.checklist_item_templates?.item_type}
                            </Badge>
                            {line.checklist_item_templates?.safety_critical && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Safety Critical
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium">
                            {line.checklist_item_templates?.item_text}
                          </p>
                          {line.checklist_item_templates?.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {line.checklist_item_templates.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLine(line.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SelectChecklistFromLibrary
        open={showAddLines}
        onOpenChange={setShowAddLines}
        onSelect={handleAddLines}
        excludeIds={existingLineIds}
      />
    </>
  );
}
