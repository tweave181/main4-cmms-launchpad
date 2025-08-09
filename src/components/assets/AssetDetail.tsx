
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { ReusableTabs } from '@/components/ui/reusable-tabs';
import { FileText, Wrench, Settings } from 'lucide-react';
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
  onDelete?: () => void;
  onUpdate?: () => void;
}

export const AssetDetail: React.FC<AssetDetailProps> = ({
  asset,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onUpdate,
}) => {
  const tabs = [
    {
      value: 'service-contract',
      label: 'Service Contract',
      icon: FileText,
      content: <AssetServiceContractInfo asset={asset} onUpdate={onUpdate} />
    },
    {
      value: 'work-orders',
      label: 'Work Orders',
      icon: Wrench,
      content: <AssetWorkOrders assetId={asset.id} />
    },
    {
      value: 'maintenance',
      label: 'Maintenance',
      icon: Settings,
      content: <div className="p-4 text-center text-muted-foreground">Maintenance features coming soon</div>
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-muted-foreground mb-2">
            Asset Details Record For: {asset.name || asset.id}
          </h2>
        </div>
        <AssetDetailHeader asset={asset} onEdit={onEdit} onDelete={onDelete} />

        <div className="space-y-6">
          <AssetBasicInfo asset={asset} />
          <AssetDescriptionSection asset={asset} />
          <AssetFinancialInfo asset={asset} />
          
          <ReusableTabs
            tabs={tabs}
            defaultValue="service-contract"
            className="mt-6"
          />
          
          <AssetRecordInfo asset={asset} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
