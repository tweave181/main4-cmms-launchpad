import type { Asset } from '@/components/assets/types';

/**
 * Build a tree structure from a flat list of assets
 */
export const buildAssetTree = (assets: Asset[]): Asset[] => {
  const assetMap = new Map<string, Asset>();
  const rootAssets: Asset[] = [];

  // First pass: Create a map of all assets with children array
  assets.forEach(asset => {
    assetMap.set(asset.id, { ...asset, children: [] });
  });

  // Second pass: Build the tree structure
  assets.forEach(asset => {
    const currentAsset = assetMap.get(asset.id);
    if (!currentAsset) return;

    if (asset.parent_asset_id) {
      const parent = assetMap.get(asset.parent_asset_id);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(currentAsset);
      } else {
        // Parent not found, treat as root
        rootAssets.push(currentAsset);
      }
    } else {
      // No parent, this is a root asset
      rootAssets.push(currentAsset);
    }
  });

  return rootAssets;
};

/**
 * Flatten a tree structure back into a flat list
 */
export const flattenAssetTree = (tree: Asset[]): Asset[] => {
  const flattened: Asset[] = [];

  const traverse = (asset: Asset) => {
    const { children, ...assetWithoutChildren } = asset;
    flattened.push(assetWithoutChildren as Asset);
    if (children && children.length > 0) {
      children.forEach(traverse);
    }
  };

  tree.forEach(traverse);
  return flattened;
};

/**
 * Get the full path of an asset (from root to asset)
 */
export const getAssetPath = (assetId: string, assets: Asset[]): Asset[] => {
  const assetMap = new Map<string, Asset>();
  assets.forEach(asset => assetMap.set(asset.id, asset));

  const path: Asset[] = [];
  let currentAsset = assetMap.get(assetId);

  while (currentAsset) {
    path.unshift(currentAsset);
    currentAsset = currentAsset.parent_asset_id 
      ? assetMap.get(currentAsset.parent_asset_id) 
      : undefined;
  }

  return path;
};

/**
 * Get breadcrumb string for an asset
 */
export const getAssetBreadcrumb = (assetId: string, assets: Asset[]): string => {
  const path = getAssetPath(assetId, assets);
  return path.map(a => a.name).join(' > ');
};

/**
 * Validate if an asset can be a parent of another asset
 */
export const validateParentChild = (
  parentAssetType: 'unit' | 'component' | 'consumable',
  childAssetType: 'unit' | 'component' | 'consumable'
): { valid: boolean; message?: string } => {
  // Units (Level 1) can only have components as children
  if (parentAssetType === 'unit' && childAssetType !== 'component') {
    return {
      valid: false,
      message: 'Units can only have Components as children'
    };
  }

  // Components (Level 2) can only have consumables as children
  if (parentAssetType === 'component' && childAssetType !== 'consumable') {
    return {
      valid: false,
      message: 'Components can only have Consumables as children'
    };
  }

  // Consumables (Level 3) cannot have children
  if (parentAssetType === 'consumable') {
    return {
      valid: false,
      message: 'Consumables cannot have children'
    };
  }

  return { valid: true };
};

/**
 * Check if selecting a parent would create a circular reference
 */
export const wouldCreateCircularReference = (
  assetId: string,
  potentialParentId: string,
  assets: Asset[]
): boolean => {
  const assetMap = new Map<string, Asset>();
  assets.forEach(asset => assetMap.set(asset.id, asset));

  // Traverse up from the potential parent to see if we find the asset
  let currentId: string | null | undefined = potentialParentId;
  while (currentId) {
    if (currentId === assetId) {
      return true; // Circular reference detected
    }
    const current = assetMap.get(currentId);
    currentId = current?.parent_asset_id;
  }

  return false;
};

/**
 * Get asset level badge configuration
 */
export const getAssetLevelConfig = (assetType: 'unit' | 'component' | 'consumable') => {
  const configs = {
    unit: {
      label: 'Unit',
      level: 1,
      icon: 'Building2',
      color: 'blue',
      bgClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    },
    component: {
      label: 'Component',
      level: 2,
      icon: 'Settings',
      color: 'green',
      bgClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    },
    consumable: {
      label: 'Consumable',
      level: 3,
      icon: 'Package',
      color: 'orange',
      bgClass: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    }
  };

  return configs[assetType];
};

/**
 * Get available parent assets based on the child asset type
 */
export const getAvailableParents = (
  childAssetType: 'unit' | 'component' | 'consumable',
  allAssets: Asset[],
  currentAssetId?: string
): Asset[] => {
  let validParentType: 'unit' | 'component' | null = null;

  // Determine what type of parent is valid
  if (childAssetType === 'component') {
    validParentType = 'unit';
  } else if (childAssetType === 'consumable') {
    validParentType = 'component';
  }

  if (!validParentType) {
    return []; // Units have no parents
  }

  // Filter assets to only show valid parent types
  return allAssets.filter(asset => {
    // Must be the correct type
    if (asset.asset_type !== validParentType) return false;
    
    // Cannot be itself
    if (currentAssetId && asset.id === currentAssetId) return false;
    
    // Cannot create circular reference
    if (currentAssetId && wouldCreateCircularReference(currentAssetId, asset.id, allAssets)) {
      return false;
    }
    
    return true;
  });
};
