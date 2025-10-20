import React from 'react';
import { ChevronRight } from 'lucide-react';
import { AssetLevelBadge } from './AssetLevelBadge';
import { getAssetPath } from '@/utils/assetHierarchyUtils';
import type { Asset } from './types';

interface AssetBreadcrumbProps {
  asset: Asset;
  allAssets: Asset[];
}

export const AssetBreadcrumb: React.FC<AssetBreadcrumbProps> = ({ asset, allAssets }) => {
  // Only show breadcrumb if asset has a parent
  if (!asset.parent_asset_id) {
    return null;
  }

  // Use the utility function to build the full path
  const path = getAssetPath(asset.id, allAssets);

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {path.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
            <div className="flex items-center gap-2">
              <AssetLevelBadge assetType={item.asset_type} showIcon={true} />
              <span className="text-sm font-medium">{item.name}</span>
              {item.asset_tag && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                  {item.asset_tag}
                </span>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
