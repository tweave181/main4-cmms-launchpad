import React from 'react';
import { Download, FileSpreadsheet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BulkActionsBarProps {
  selectedCount: number;
  onDownloadZip: () => void;
  onExportCSV: () => void;
  onClearSelection: () => void;
  isDownloading?: boolean;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedCount,
  onDownloadZip,
  onExportCSV,
  onClearSelection,
  isDownloading = false
}) => {
  return (
    <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDownloadZip}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download as ZIP
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExportCSV}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export List (CSV)
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          <X className="h-4 w-4 mr-2" />
          Clear Selection
        </Button>
      </div>
    </Card>
  );
};
