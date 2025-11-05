
import { OfflineStorageManager } from './offlineStorage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export class NetworkManager {
  private static instance: NetworkManager;
  private onlineCallbacks: (() => void)[] = [];
  private offlineCallbacks: (() => void)[] = [];
  
  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.handleOnline();
    });

    window.addEventListener('offline', () => {
      this.handleOffline();
    });
  }

  private handleOnline(): void {
    console.log('Network connection restored');
    toast({
      title: "Connection Restored",
      description: "Syncing offline changes...",
    });
    this.syncOfflineData();
    this.onlineCallbacks.forEach(callback => callback());
  }

  private handleOffline(): void {
    console.log('Network connection lost');
    toast({
      title: "You're Offline",
      description: "Changes will be saved locally and synced when connection is restored.",
      variant: "destructive",
    });
    this.offlineCallbacks.forEach(callback => callback());
  }

  private async syncOfflineData(): Promise<void> {
    const storage = OfflineStorageManager.getInstance();
    const offlineWorkOrders = storage.getOfflineWorkOrders().filter(item => !item.synced);

    for (const workOrder of offlineWorkOrders) {
      try {
        if (workOrder.action === 'create') {
          await supabase.from('work_orders').insert(workOrder.data as never);
        } else if (workOrder.action === 'update') {
          await supabase.from('work_orders').update(workOrder.data as never).eq('id', workOrder.id);
        }
        storage.markWorkOrderSynced(workOrder.id);
      } catch (error) {
        console.error('Failed to sync work order:', error);
      }
    }

    storage.clearSyncedData();
    toast({
      title: "Sync Complete",
      description: "All offline changes have been synchronized.",
    });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  onOnline(callback: () => void): void {
    this.onlineCallbacks.push(callback);
  }

  onOffline(callback: () => void): void {
    this.offlineCallbacks.push(callback);
  }
}
