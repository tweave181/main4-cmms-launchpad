import React, { useState } from 'react';
import { Camera, Download } from 'lucide-react';
import { ChecklistItemTemplate } from '@/types/checklistTemplate';
import { ChecklistTypeBadge } from './ChecklistTypeIcons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { downloadSingleImage } from '@/utils/imageDownloadUtils';
import { toast } from 'sonner';
import { ImageModal } from './ImageModal';
import { ImageNameEditor } from './ImageNameEditor';

interface ImageGalleryViewProps {
  templates: ChecklistItemTemplate[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

export const ImageGalleryView: React.FC<ImageGalleryViewProps> = ({
  templates,
  selectedIds,
  onToggleSelect
}) => {
  const [viewingTemplate, setViewingTemplate] = useState<ChecklistItemTemplate | null>(null);
  const [viewingIndex, setViewingIndex] = useState<number>(-1);

  // Only show templates with images
  const templatesWithImages = templates.filter(t => t.image_url);

  const handleDownload = async (template: ChecklistItemTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!template.image_url) return;
    
    try {
      await downloadSingleImage(
        template.image_url,
        template.image_name || template.item_text
      );
      toast.success('Image downloaded');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const handleImageClick = (template: ChecklistItemTemplate, index: number) => {
    setViewingTemplate(template);
    setViewingIndex(index);
  };

  const handleNext = () => {
    if (viewingIndex < templatesWithImages.length - 1) {
      const nextIndex = viewingIndex + 1;
      setViewingIndex(nextIndex);
      setViewingTemplate(templatesWithImages[nextIndex]);
    }
  };

  const handlePrevious = () => {
    if (viewingIndex > 0) {
      const prevIndex = viewingIndex - 1;
      setViewingIndex(prevIndex);
      setViewingTemplate(templatesWithImages[prevIndex]);
    }
  };

  if (templatesWithImages.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No images found in checklist lines library</p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templatesWithImages.map((template, index) => (
          <Card
            key={template.id}
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
          >
            {/* Image */}
            <div 
              className="relative aspect-video bg-muted overflow-hidden"
              onClick={() => handleImageClick(template, index)}
            >
              <img
                src={template.image_url}
                alt={template.item_text}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              {/* Checkbox and Item Text */}
              <div className="flex items-start gap-2">
                <Checkbox
                  checked={selectedIds.has(template.id)}
                  onCheckedChange={() => onToggleSelect(template.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2">{template.item_text}</h3>
                </div>
              </div>

              {/* Image Name */}
              <div onClick={(e) => e.stopPropagation()}>
                <ImageNameEditor
                  templateId={template.id}
                  currentName={template.image_name || template.item_text}
                />
              </div>

              {/* Type and Safety Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <ChecklistTypeBadge type={template.item_type} />
                {template.safety_critical && (
                  <Badge variant="destructive" className="text-xs">
                    Safety Critical
                  </Badge>
                )}
              </div>

              {/* Download Button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => handleDownload(template, e)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      <ImageModal
        template={viewingTemplate}
        open={!!viewingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setViewingTemplate(null);
            setViewingIndex(-1);
          }
        }}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={viewingIndex < templatesWithImages.length - 1}
        hasPrevious={viewingIndex > 0}
      />
    </>
  );
};
