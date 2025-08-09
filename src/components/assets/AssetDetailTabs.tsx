import React, { useState } from 'react';
import { AssetServiceContractInfo } from './AssetServiceContractInfo';
import { AssetWorkOrders } from './AssetWorkOrders';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'] & {
  service_contract?: {
    id: string;
    contract_title: string;
    vendor_name: string;
    status: string;
    end_date: string;
  } | null;
};

interface AssetDetailTabsProps {
  asset: Asset;
  onUpdate?: () => void;
}

export const AssetDetailTabs: React.FC<AssetDetailTabsProps> = ({ asset, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('service-contract');

  const tabs = [
    { id: 'service-contract', label: 'Service Contract' },
    { id: 'work-orders', label: 'Work Orders' },
    { id: 'maintenance', label: 'Maintenance' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'service-contract':
        return <AssetServiceContractInfo asset={asset} onUpdate={onUpdate} />;
      case 'work-orders':
        return <AssetWorkOrders assetId={asset.id} />;
      case 'maintenance':
        return (
          <div className="p-4 text-center text-muted-foreground">
            Maintenance features coming soon
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 focus:outline-none ${
              activeTab === tab.id
                ? 'text-gray-700 border-blue-500'
                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {renderTabContent()}
      </div>
    </div>
  );
};