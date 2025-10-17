import React from 'react';
import { ChevronRight } from 'lucide-react';
import { AssetLevelBadge } from './AssetLevelBadge';
import type { Asset } from './types';

interface AssetBreadcrumbProps {
  asset: Asset;
}

export const AssetBreadcrumb: React.FC<AssetBreadcrumbProps> = ({ asset }) => {
  const buildPath = (currentAsset: Asset): Asset[] => {
    const path: Asset[] = [currentAsset];
    let current = currentAsset;
    
    while (current.parent) {
      // Create a minimal asset object from parent data
      const parentAsset: Asset = {
        id: current.parent.id,
        name: current.parent.name,
        asset_tag: current.parent.asset_tag,
        tenant_id: current.tenant_id,
        status: 'active',
        priority: 'medium',
        asset_level: current.asset_level > 1 ? (current.asset_level - 1) as 1 | 2 | 3 : 1,
        asset_type: current.asset_type === 'component' ? 'unit' : 'component',
        created_at: '',
        updated_at: '',
        parent: null
      };
      path.unshift(parentAsset);
      current = parentAsset;
    }
    
    return path;
  };

  const path = buildPath(asset);

  if (path.length <= 1) {
    return null;
  }

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
