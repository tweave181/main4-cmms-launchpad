import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddressList } from '@/components/addresses/AddressList';
import { AddressFormModal } from '@/components/addresses/AddressFormModal';
import { useAuth } from '@/contexts/auth';
import {
  PENDING_CONTRACT_DRAFT_KEY,
  PENDING_NEW_VENDOR_KEY,
} from '@/components/contracts/ServiceContractModal';
import type { Address } from '@/types/address';

const Addresses: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const addVendorMode = searchParams.get('addVendor') === '1';

  useEffect(() => {
    if (addVendorMode) {
      setIsAddFormOpen(true);
    }
  }, [addVendorMode]);

  const handleClose = () => {
    setIsAddFormOpen(false);
    if (addVendorMode) {
      // Clear the query param so reopening the page doesn't re-trigger
      searchParams.delete('addVendor');
      setSearchParams(searchParams, { replace: true });
      // If user cancels without saving, also drop the pending draft
      const draftRaw = sessionStorage.getItem(PENDING_CONTRACT_DRAFT_KEY);
      if (draftRaw && !sessionStorage.getItem(PENDING_NEW_VENDOR_KEY)) {
        // keep draft so user can return manually; but navigate back
        try {
          const draft = JSON.parse(draftRaw);
          if (draft.returnPath) navigate(draft.returnPath);
        } catch {}
      }
    }
  };

  const handleAddressCreated = (address: Address) => {
    if (addVendorMode && address.company_id) {
      sessionStorage.setItem(PENDING_NEW_VENDOR_KEY, address.company_id);
      const draftRaw = sessionStorage.getItem(PENDING_CONTRACT_DRAFT_KEY);
      let returnPath = '/admin/service-contracts';
      try {
        if (draftRaw) {
          const draft = JSON.parse(draftRaw);
          if (draft.returnPath) returnPath = draft.returnPath;
        }
      } catch {}
      setIsAddFormOpen(false);
      navigate(returnPath);
    } else {
      setIsAddFormOpen(false);
    }
  };

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

  const handleReturnToContract = () => {
    const draftRaw = sessionStorage.getItem(PENDING_CONTRACT_DRAFT_KEY);
    let returnPath = '/admin/service-contracts';
    try {
      if (draftRaw) {
        const draft = JSON.parse(draftRaw);
        if (draft?.returnPath) returnPath = draft.returnPath;
      }
    } catch {}
    setIsAddFormOpen(false);
    navigate(returnPath);
  };

  return (
    <div className="p-6 space-y-4">
      {addVendorMode && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <nav className="flex items-center text-sm text-muted-foreground" aria-label="Breadcrumb">
            <button
              onClick={handleReturnToContract}
              className="font-medium text-primary hover:underline"
            >
              Service Contract
            </button>
            <ChevronRight className="mx-2 h-4 w-4" />
            <span className="text-foreground">Add New Vendor</span>
          </nav>
          <Button variant="outline" size="sm" onClick={handleReturnToContract}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Service Contract
          </Button>
        </div>
      )}

      <Card className="rounded-2xl shadow-sm border border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold flex items-center space-x-3">
            <MapPin className="h-6 w-6 text-primary" />
            <span>Address Management List</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AddressList
            onAddAddress={() => setIsAddFormOpen(true)}
          />
        </CardContent>
      </Card>

      <AddressFormModal
        isOpen={isAddFormOpen}
        onClose={handleClose}
        onSuccess={handleAddressCreated}
      />
    </div>
  );
};

export default Addresses;
