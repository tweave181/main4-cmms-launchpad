import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { AddressList } from '@/components/addresses/AddressList';
import { AddressFormModal } from '@/components/addresses/AddressFormModal';
import { useAuth } from '@/contexts/auth';

const Addresses: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

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
            <span>Address Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddressList onAddAddress={() => setIsAddFormOpen(true)} />
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