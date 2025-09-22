import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AssetDetailHeader } from './AssetDetailHeader';
import { AssetBasicInfo } from './AssetBasicInfo';
import { AssetFinancialInfo } from './AssetFinancialInfo';
import { AssetDescriptionSection } from './AssetDescriptionSection';
import { AssetRecordInfo } from './AssetRecordInfo';
import { AssetDetailTabs } from './AssetDetailTabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import type { Database } from '@/integrations/supabase/types';
type Asset = Database['public']['Tables']['assets']['Row'] & {
  service_contract?: {
    id: string;
    contract_title: string;
    vendor_name: string;
    status: string;
    end_date: string;
  } | null;
};
interface AssetDetailProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onUpdate?: () => void;
}
export const AssetDetail: React.FC<AssetDetailProps> = ({
  asset,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
  onUpdate
}) => {
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        
        <AssetDetailHeader asset={asset} onEdit={onEdit} onDelete={onDelete} onDuplicate={onDuplicate} />

        <div className="space-y-6">
          <AssetBasicInfo asset={asset} />
          <AssetDescriptionSection asset={asset} />
          <AssetFinancialInfo asset={asset} />
          
          <div className="h-[50vh] min-h-[320px]">
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="h-full">
                  <AssetDetailTabs asset={asset} onUpdate={onUpdate} />
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
    </Dialog>;
};