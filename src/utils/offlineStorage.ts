
// Generic cached data types - flexible to accept any structured object
export type CachedItem = Record<string, unknown> & { id: string };

export interface OfflineWorkOrder {
  id: string;
  data: Record<string, unknown>;
  timestamp: number;
  action: 'create' | 'update' | 'status_change';
  synced: boolean;
}

export interface OfflineAsset {
  id: string;
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

export class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  
  static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  // Work Orders
  saveOfflineWorkOrder(workOrder: Omit<OfflineWorkOrder, 'timestamp' | 'synced'>): void {
    const offlineData = this.getOfflineWorkOrders();
    const newEntry: OfflineWorkOrder = {
      ...workOrder,
      timestamp: Date.now(),
      synced: false
    };
    offlineData.push(newEntry);
    localStorage.setItem('offline_work_orders', JSON.stringify(offlineData));
  }

  getOfflineWorkOrders(): OfflineWorkOrder[] {
    const data = localStorage.getItem('offline_work_orders');
    return data ? JSON.parse(data) : [];
  }

  markWorkOrderSynced(id: string): void {
    const offlineData = this.getOfflineWorkOrders();
    const updated = offlineData.map(item => 
      item.id === id ? { ...item, synced: true } : item
    );
    localStorage.setItem('offline_work_orders', JSON.stringify(updated));
  }

  // Cached Work Orders for offline viewing
  cacheWorkOrders(workOrders: unknown[]): void {
    localStorage.setItem('cached_work_orders', JSON.stringify(workOrders));
  }

  getCachedWorkOrders<T = unknown>(): T[] {
    const data = localStorage.getItem('cached_work_orders');
    return data ? JSON.parse(data) : [];
  }

  // Assets
  cacheAssets(assets: unknown[]): void {
    localStorage.setItem('cached_assets', JSON.stringify(assets));
  }

  getCachedAssets<T = unknown>(): T[] {
    const data = localStorage.getItem('cached_assets');
    return data ? JSON.parse(data) : [];
  }

  // PM Tasks
  cachePMTasks(tasks: unknown[]): void {
    localStorage.setItem('cached_pm_tasks', JSON.stringify(tasks));
  }

  getCachedPMTasks<T = unknown>(): T[] {
    const data = localStorage.getItem('cached_pm_tasks');
    return data ? JSON.parse(data) : [];
  }

  // Sync status
  clearSyncedData(): void {
    const offlineWorkOrders = this.getOfflineWorkOrders().filter(item => !item.synced);
    localStorage.setItem('offline_work_orders', JSON.stringify(offlineWorkOrders));
  }
}
