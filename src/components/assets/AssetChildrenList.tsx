import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit } from 'lucide-react';
import type { Asset } from './types';
import { AssetLevelBadge } from './AssetLevelBadge';

interface AssetChildrenListProps {
  asset: Asset;
  onViewChild: (child: Asset) => void;
  onEditChild: (child: Asset) => void;
}

export const AssetChildrenList: React.FC<AssetChildrenListProps> = ({ 
  asset, 
  onViewChild, 
  onEditChild
}) => {
  const children = asset.children || [];
  const canHaveChildren = asset.asset_type !== 'consumable';
  const childType = asset.asset_type === 'unit' ? 'component' : 'consumable';
  const childTypeLabel = childType === 'component' ? 'Component' : 'Consumable';

  if (!canHaveChildren) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground text-center">
            Consumables cannot have child assets
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {childTypeLabel}s ({children.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {children.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No {childTypeLabel.toLowerCase()}s linked yet</p>
            <p className="text-xs mt-1">
              Create a {childTypeLabel.toLowerCase()} asset and link it by setting its parent
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AssetLevelBadge assetType={child.asset_type} showIcon={false} />
                    <span className="font-medium">{child.name}</span>
                  </div>
                  {child.asset_tag && (
                    <span className="text-xs text-muted-foreground">
                      {child.asset_tag}
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onViewChild(child)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditChild(child)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
