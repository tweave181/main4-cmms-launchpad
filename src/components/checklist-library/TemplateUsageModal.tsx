import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTemplateUsage } from '@/hooks/useChecklistTemplates';
import { formatDistanceToNow } from 'date-fns';

interface TemplateUsageModalProps {
  templateId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TemplateUsageModal: React.FC<TemplateUsageModalProps> = ({
  templateId,
  open,
  onOpenChange,
}) => {
  const { data: usage, isLoading } = useTemplateUsage(templateId);
  const navigate = useNavigate();

  const handleNavigate = (scheduleId: string) => {
    navigate(`/maintenance/pm-schedule/${scheduleId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Used In PM Schedules</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading...</div>
        ) : usage && usage.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-4">
              This checklist item is used in {usage.length} PM schedule{usage.length > 1 ? 's' : ''}:
            </p>
            <div className="border rounded-lg divide-y">
              {usage.map((item: any) => (
                <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/50">
                  <div>
                    <h4 className="font-medium">{item.preventive_maintenance_schedules?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Last updated {formatDistanceToNow(new Date(item.preventive_maintenance_schedules?.updated_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleNavigate(item.pm_schedule_id)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            This item is not currently used in any PM schedules
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
