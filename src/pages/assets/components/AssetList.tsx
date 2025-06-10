
import React from 'react';
import { AssetCard } from './AssetCard';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetListProps {
  assets: Asset[];
  onViewAsset: (asset: Asset) => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (assetId: string) => void;
}

export const AssetList: React.FC<AssetListProps> = ({
  assets,
  onViewAsset,
  onEditAsset,
  onDeleteAsset,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {assets.map((asset) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          onView={onViewAsset}
          onEdit={onEditAsset}
          onDelete={onDeleteAsset}
        />
      ))}
    </div>
  );
};
