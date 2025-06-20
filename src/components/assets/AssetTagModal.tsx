
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useAssetTagGeneration } from './hooks/useAssetTagGeneration';
import { AssetTagPrefixSelector } from './AssetTagPrefixSelector';
import { GeneratedTagDisplay } from './GeneratedTagDisplay';

interface AssetTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTagSelect: (tag: string) => void;
  currentTag?: string;
}

export const AssetTagModal: React.FC<AssetTagModalProps> = ({
  isOpen,
  onClose,
  onTagSelect,
  currentTag = '',
}) => {
  const {
    prefixes,
    isLoading,
    selectedPrefix,
    setSelectedPrefix,
    nextSequence,
    generatedTag,
    isGenerating,
    validationError,
    setValidationError,
    validateAndSelectTag,
    resetState,
  } = useAssetTagGeneration();

  const handlePrefixChange = (prefixId: string) => {
    const prefix = prefixes.find(p => p.id === prefixId);
    setSelectedPrefix(prefix || null);
    setValidationError('');
  };

  const handleValidateAndSelect = async () => {
    const success = await validateAndSelectTag(currentTag, onTagSelect);
    if (success) {
      handleClose();
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Asset Tag</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Asset Tag</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {prefixes.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                All available asset tag prefixes have reached their capacity (999 assets each). 
                Please contact an administrator to add new prefixes before creating assets.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <AssetTagPrefixSelector 
                prefixes={prefixes}
                onPrefixChange={handlePrefixChange}
              />

              <GeneratedTagDisplay
                generatedTag={generatedTag}
                nextSequence={nextSequence}
                isGenerating={isGenerating}
              />
            </>
          )}

          {validationError && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleValidateAndSelect}
              disabled={!generatedTag || isGenerating || prefixes.length === 0}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                'Select Tag'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
