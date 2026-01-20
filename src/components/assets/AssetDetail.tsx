import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AssetDetailHeader } from './AssetDetailHeader';
import { AssetBasicInfo } from './AssetBasicInfo';
import { AssetFinancialInfo } from './AssetFinancialInfo';
import { AssetDescriptionSection } from './AssetDescriptionSection';
import { AssetRecordInfo } from './AssetRecordInfo';
import { AssetDetailTabs } from './AssetDetailTabs';
import { AssetBreadcrumb } from './AssetBreadcrumb';
import { PrintBarcodeLabelModal } from './PrintBarcodeLabelModal';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import type { Asset } from './types';
interface AssetDetailProps {
  asset: Asset;
  allAssets: Asset[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onUpdate?: () => void;
}
export const AssetDetail: React.FC<AssetDetailProps> = ({
  asset,
  allAssets,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onUpdate
}) => {
  const [showQRModal, setShowQRModal] = useState(false);

  const handleViewChild = (child: Asset) => {
    // For now, we'll just close the current modal and let the parent handle navigation
    // In a more complex setup, you might open a nested modal or navigate to the child
    console.log('View child:', child);
  };

  const handleEditChild = (child: Asset) => {
    // Close current modal and trigger edit on the child
    onClose();
    // The parent component should handle opening the edit form for this child
    console.log('Edit child:', child);
  };
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          
          <AssetDetailHeader 
            asset={asset} 
            onEdit={onEdit} 
            onDelete={onDelete} 
            onDuplicate={onDuplicate} 
            onPrintQRLabel={() => setShowQRModal(true)}
          />

          <div className="space-y-6">
            <AssetBreadcrumb asset={asset} allAssets={allAssets} />
            <AssetBasicInfo asset={asset} />
            <AssetDescriptionSection asset={asset} />
            <AssetFinancialInfo asset={asset} />
            
            <div className="h-[50vh] min-h-[320px]">
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={60} minSize={30}>
                  <div className="h-full">
                    <AssetDetailTabs 
                      asset={asset} 
                      onUpdate={onUpdate}
                      onViewChild={handleViewChild}
                      onEditChild={handleEditChild}
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={40} minSize={20}>
                  <div className="h-full overflow-auto">
                    <AssetRecordInfo asset={asset} />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {asset.asset_tag && (
        <PrintBarcodeLabelModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          assetTag={asset.asset_tag}
          assetName={asset.name}
        />
      )}
    </>
  );
};