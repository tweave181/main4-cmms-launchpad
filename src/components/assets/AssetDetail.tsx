
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { AssetDetailHeader } from './AssetDetailHeader';
import { AssetWorkOrders } from './AssetWorkOrders';
import { AssetBasicInfo } from './AssetBasicInfo';
import { AssetFinancialInfo } from './AssetFinancialInfo';
import { AssetDescriptionSection } from './AssetDescriptionSection';
import { AssetRecordInfo } from './AssetRecordInfo';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetDetailProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const AssetDetail: React.FC<AssetDetailProps> = ({
  asset,
  isOpen,
  onClose,
  onEdit,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <AssetDetailHeader asset={asset} onEdit={onEdit} />

        <div className="space-y-6">
          <AssetWorkOrders assetId={asset.id} />
          <AssetBasicInfo asset={asset} />
          <AssetFinancialInfo asset={asset} />
          <AssetDescriptionSection asset={asset} />
          <AssetRecordInfo asset={asset} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
