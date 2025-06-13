
import { useState, useEffect } from 'react';
import { useWorkOrders } from './useWorkOrders';
import { OfflineStorageManager } from '@/utils/offlineStorage';
import { NetworkManager } from '@/utils/networkManager';
import type { WorkOrder, WorkOrderFilters } from '@/types/workOrder';

export const useOfflineWorkOrders = (filters?: WorkOrderFilters) => {
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
  const onlineQuery = useWorkOrders(filters);
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
    if (!offlineMode && onlineQuery.data) {
      storage.cacheWorkOrders(onlineQuery.data);
    }
  }, [onlineQuery.data, offlineMode]);

  const data = offlineMode ? storage.getCachedWorkOrders() : onlineQuery.data;
  const isLoading = offlineMode ? false : onlineQuery.isLoading;

  return {
    data,
    isLoading,
    isOffline: offlineMode,
    refetch: onlineQuery.refetch,
  };
};
