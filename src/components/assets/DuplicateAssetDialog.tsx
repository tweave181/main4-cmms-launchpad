import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Asset } from '@/components/assets/types';

interface DuplicateAssetDialogProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (keepServiceContract: boolean) => void;
  isLoading?: boolean;
}

export const DuplicateAssetDialog: React.FC<DuplicateAssetDialogProps> = ({
  asset,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [keepServiceContract, setKeepServiceContract] = useState(false);

  const handleConfirm = () => {
    onConfirm(keepServiceContract);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicate Asset Record
          </DialogTitle>
          <DialogDescription>
            Create a duplicate of "{asset.name}" with the following changes:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What will be copied:</strong>
              <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                <li>Name (with "Copy" suffix)</li>
                <li>All basic asset information</li>
                <li>Category, location, and department</li>
                <li>Purchase information and warranty</li>
                <li>Status and priority</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What will be cleared:</strong>
              <ul className="mt-2 ml-4 list-disc text-sm space-y-1">
                <li>New asset tag will be generated</li>
                <li>Serial number will be cleared</li>
                <li>Work orders will not be copied</li>
                <li>Maintenance jobs will not be copied</li>
              </ul>
            </AlertDescription>
          </Alert>

          {asset.service_contract_id && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="keep-service-contract"
                checked={keepServiceContract}
                onCheckedChange={(checked) => setKeepServiceContract(checked === true)}
              />
              <label
                htmlFor="keep-service-contract"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Keep service contract linked to the duplicate
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading} className="min-w-[100px]">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                Duplicating...
              </div>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};