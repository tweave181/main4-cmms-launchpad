import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2, Settings, Package } from 'lucide-react';
import { getAssetLevelConfig } from '@/utils/assetHierarchyUtils';

interface AssetLevelBadgeProps {
  assetType: 'unit' | 'component' | 'consumable';
  showIcon?: boolean;
  className?: string;
}

export const AssetLevelBadge: React.FC<AssetLevelBadgeProps> = ({
  assetType,
  showIcon = true,
  className = ''
}) => {
  const config = getAssetLevelConfig(assetType);
  
  const IconComponent = {
    Building2,
    Settings,
    Package
  }[config.icon as keyof typeof import('lucide-react')];

  return (
    <Badge variant="secondary" className={`${config.bgClass} ${className}`}>
      {showIcon && IconComponent && <IconComponent className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
};
