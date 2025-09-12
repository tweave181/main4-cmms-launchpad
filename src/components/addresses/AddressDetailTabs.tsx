import React, { useState } from 'react';
import { ContactsList } from '@/components/address-contacts/ContactsList';
import { FileText } from 'lucide-react';
import type { Address } from '@/types/address';

interface AddressDetailTabsProps {
  address: Address;
  onUpdate?: () => void;
}

export const AddressDetailTabs: React.FC<AddressDetailTabsProps> = ({ address, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('contacts');

  const tabs = [
    { id: 'contacts', label: 'Contacts' },
    { id: 'contracts', label: 'Contract Details' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'contacts':
        return <ContactsList addressId={address.id} />;
      case 'contracts':
        return (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No service contracts linked yet.</p>
            <p className="text-sm mt-2">Service contract functionality will be available soon.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <div
        className="flex border-b border-border"
        role="tablist"
        aria-label="Address detail sections"
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