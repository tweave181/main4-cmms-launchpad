import React, { useState } from 'react';
import { AssetServiceContractInfo } from './AssetServiceContractInfo';
import { AssetWorkOrders } from './AssetWorkOrders';
import { AssetMaintenanceTab } from './AssetMaintenanceTab';
import { AssetSparePartsList } from './AssetSparePartsList';
import type { Asset } from './types';

interface AssetDetailTabsProps {
  asset: Asset;
  onUpdate?: () => void;
}

export const AssetDetailTabs: React.FC<AssetDetailTabsProps> = ({ asset, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('service-contract');

  const tabs = [
    { id: 'service-contract', label: 'Service Contract' },
    { id: 'work-orders', label: 'Work Orders' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'spare-parts', label: 'Spare Parts List' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'service-contract':
        return <AssetServiceContractInfo asset={asset} onUpdate={onUpdate} />;
      case 'work-orders':
        return <AssetWorkOrders assetId={asset.id} />;
      case 'maintenance':
        return <AssetMaintenanceTab assetId={asset.id} />;
      case 'spare-parts':
        return <AssetSparePartsList assetId={asset.id} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <div
        className="flex border-b border-border"
        role="tablist"
        aria-label="Asset detail sections"
      >
        {tabs.map((tab, idx) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              role="tab"
              aria-selected={active}
              aria-controls={`panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight') {
                  const next = (idx + 1) % tabs.length
                  setActiveTab(tabs[next].id)
                } else if (e.key === 'ArrowLeft') {
                  const prev = (idx - 1 + tabs.length) % tabs.length
                  setActiveTab(tabs[prev].id)
                }
              }}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 -mb-px text-sm font-medium border-b-2 focus:outline-none ${
                active
                  ? 'text-foreground border-primary'
                  : 'text-muted-foreground hover:text-foreground border-transparent hover:border-border'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
      <div
        id={`panel-${activeTab}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeTab}`}
        className="mt-4 flex-1 min-h-0 overflow-auto"
      >
        {renderTabContent()}
      </div>
    </div>
  );
};