
import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';
import { NetworkManager } from '@/utils/networkManager';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const networkManager = NetworkManager.getInstance();
    
    networkManager.onOnline(() => setIsOnline(true));
    networkManager.onOffline(() => setIsOnline(false));

    return () => {
      // Cleanup would be handled by NetworkManager singleton
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <Alert className="border-orange-200 bg-orange-50 text-orange-800 mx-4 mt-4">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex items-center">
        <span>You're offline. Changes will be saved locally and synced when connection is restored.</span>
      </AlertDescription>
    </Alert>
  );
};
