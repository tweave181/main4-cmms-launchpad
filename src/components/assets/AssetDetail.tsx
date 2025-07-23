
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { AssetDetailHeader } from './AssetDetailHeader';
import { AssetWorkOrders } from './AssetWorkOrders';
import { AssetBasicInfo } from './AssetBasicInfo';
import { AssetFinancialInfo } from './AssetFinancialInfo';
import { AssetServiceContractInfo } from './AssetServiceContractInfo';
import { AssetDescriptionSection } from './AssetDescriptionSection';
import { AssetRecordInfo } from './AssetRecordInfo';
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
          <AssetBasicInfo asset={asset} />
          <AssetDescriptionSection asset={asset} />
          <AssetFinancialInfo asset={asset} />
          <AssetServiceContractInfo asset={asset} />
          <AssetRecordInfo asset={asset} />
          <AssetWorkOrders assetId={asset.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
