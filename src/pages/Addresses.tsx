import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { AddressList } from '@/components/addresses/AddressList';
import { AddressFormModal } from '@/components/addresses/AddressFormModal';
import { AddressDetailTabs } from '@/components/addresses/AddressDetailTabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { useAuth } from '@/contexts/auth';
import { useAddresses } from '@/hooks/useAddresses';
import type { Address } from '@/types/address';

const Addresses: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const { data: addresses } = useAddresses();

  if (!isAdmin) {
    return (
      <div className="p-6">
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Access denied. This page is only available to administrators.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
            <MapPin className="h-6 w-6 text-primary" />
            <span>Address Management List</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[70vh] min-h-[500px]">
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel defaultSize={60} minSize={40}>
                <div className="h-full pr-2">
                  <AddressList 
                    onAddAddress={() => setIsAddFormOpen(true)} 
                    onSelectAddress={setSelectedAddress}
                    selectedAddress={selectedAddress}
                  />
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40} minSize={30}>
                <div className="h-full pl-2">
                  {selectedAddress ? (
                    <AddressDetailTabs address={selectedAddress} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Select an address to view details</p>
                      </div>
                    </div>
                  )}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        </CardContent>
      </Card>

      <AddressFormModal
        isOpen={isAddFormOpen}
        onClose={() => setIsAddFormOpen(false)}
      />
    </div>
  );
};

export default Addresses;