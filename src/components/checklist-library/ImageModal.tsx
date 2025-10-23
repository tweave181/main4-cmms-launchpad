import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { ChecklistItemTemplate } from '@/types/checklistTemplate';
import { ChecklistTypeBadge } from './ChecklistTypeIcons';
import { Badge } from '@/components/ui/badge';
import { downloadSingleImage } from '@/utils/imageDownloadUtils';
import { toast } from 'sonner';
import { ImageNameEditor } from './ImageNameEditor';

interface ImageModalProps {
  template: ChecklistItemTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  template,
  open,
  onOpenChange,
  onPrevious,
  onNext,
  hasNext,
  hasPrevious
}) => {
  const handleDownload = async () => {
    if (!template?.image_url) return;
    
    try {
      await downloadSingleImage(
        template.image_url,
        template.image_name || template.item_text
      );
      toast.success('Image downloaded successfully');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{template.item_text}</span>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="relative bg-muted rounded-lg overflow-hidden">
            {template.image_url ? (
              <img
                src={template.image_url}
                alt={template.item_text}
                className="w-full h-auto max-h-[60vh] object-contain"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-muted-foreground">
                No image available
              </div>
            )}
            
            {/* Navigation arrows */}
            {hasPrevious && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2"
                onClick={onPrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            {hasNext && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={onNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Image Name</label>
              <div className="mt-1">
                {template.image_url ? (
                  <ImageNameEditor
                    templateId={template.id}
                    currentName={template.image_name || template.item_text}
                  />
                ) : (
                  <span className="text-sm">N/A</span>
                )}
              </div>
            </div>

            {template.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm">{template.description}</p>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <div className="mt-1">
                  <ChecklistTypeBadge type={template.item_type} />
                </div>
              </div>

              {template.safety_critical && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Safety</label>
                  <div className="mt-1">
                    <Badge variant="destructive" className="text-xs">
                      Safety Critical
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
