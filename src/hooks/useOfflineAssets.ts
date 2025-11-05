
import { useState, useEffect } from 'react';
import { useAssets } from '@/pages/assets/hooks/useAssets';
import { OfflineStorageManager } from '@/utils/offlineStorage';
import { NetworkManager } from '@/utils/networkManager';

import { Asset } from '@/components/assets/types';

export const useOfflineAssets = () => {
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
  const onlineQuery = useAssets();
  const storage = OfflineStorageManager.getInstance();
  const networkManager = NetworkManager.getInstance();

  useEffect(() => {
    const handleOnline = () => {
      setOfflineMode(false);
    };

    const handleOffline = () => {
      setOfflineMode(true);
    };

    networkManager.onOnline(handleOnline);
    networkManager.onOffline(handleOffline);

    // Cache data when online
    if (!offlineMode && onlineQuery.assets) {
      storage.cacheAssets(onlineQuery.assets);
    }
  }, [onlineQuery.assets, offlineMode]);

  const assets = offlineMode ? storage.getCachedAssets<Asset>() : onlineQuery.assets;
  const isLoading = offlineMode ? false : onlineQuery.isLoading;

  return {
    assets,
    isLoading,
    isOffline: offlineMode,
    refetch: onlineQuery.refetch,
    deleteAsset: onlineQuery.deleteAsset,
  };
};
