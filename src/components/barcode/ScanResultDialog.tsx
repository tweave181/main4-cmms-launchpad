import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Package, Boxes } from 'lucide-react';

interface ScanResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  scannedCode: string;
  asset?: { id: string; name: string };
  part?: { id: string; name: string };
  onSelectAsset: () => void;
  onSelectPart: () => void;
}

export const ScanResultDialog: React.FC<ScanResultDialogProps> = ({
  isOpen,
  onClose,
  scannedCode,
  asset,
  part,
  onSelectAsset,
  onSelectPart,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Multiple Matches Found</DialogTitle>
          <DialogDescription>
            The code "{scannedCode}" matches both an asset and an inventory part. 
            Please select which record to open.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          {asset && (
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={onSelectAsset}
            >
              <Package className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <div className="font-medium">Asset</div>
                <div className="text-sm text-muted-foreground">{asset.name}</div>
              </div>
            </Button>
          )}
          
          {part && (
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={onSelectPart}
            >
              <Boxes className="h-5 w-5 mr-3 text-primary" />
              <div className="text-left">
                <div className="font-medium">Inventory Part</div>
                <div className="text-sm text-muted-foreground">{part.name}</div>
              </div>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
