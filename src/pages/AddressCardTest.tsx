import React from 'react';
import { IndexAddressCard } from '@/components/IndexAddressCard';
import { useAddresses } from '@/hooks/useAddresses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Grid, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const AddressCardTest = () => {
  const navigate = useNavigate();
  const { data: addresses = [], isLoading } = useAddresses();
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

  const handleCardClick = (address: any) => {
    toast.success(`Clicked on: ${address.company_details?.company_name || 'No Company'}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">IndexAddressCard Test</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">IndexAddressCard Test</h1>
            <p className="text-muted-foreground">Testing the address card component with real data</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Test Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{addresses.length}</div>
              <div className="text-sm text-muted-foreground">Total Addresses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {addresses.filter(a => a.is_supplier).length}
              </div>
              <div className="text-sm text-muted-foreground">Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {addresses.filter(a => a.is_manufacturer).length}
              </div>
              <div className="text-sm text-muted-foreground">Manufacturers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {addresses.filter(a => a.is_contractor).length}
              </div>
              <div className="text-sm text-muted-foreground">Contractors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Cards Display */}
      {addresses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No addresses found to test with.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate('/addresses')}>
              Go to Addresses Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Grid View */}
          {viewMode === 'grid' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Grid Layout</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {addresses.slice(0, 12).map((address) => (
                  <IndexAddressCard
                    key={address.id}
                    address={address}
                    onClick={handleCardClick}
                    showActions={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">List Layout</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {addresses.slice(0, 10).map((address) => (
                  <IndexAddressCard
                    key={address.id}
                    address={address}
                    onClick={handleCardClick}
                    showActions={true}
                    className="w-full"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Special Cases */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Special Cases</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Card without actions */}
              {addresses[0] && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Without Actions</h3>
                  <IndexAddressCard
                    address={addresses[0]}
                    showActions={false}
                  />
                </div>
              )}

              {/* Card without onClick */}
              {addresses[1] && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">No Click Handler</h3>
                  <IndexAddressCard
                    address={addresses[1]}
                    showActions={true}
                  />
                </div>
              )}

              {/* Card with custom styling */}
              {addresses[2] && (
                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Custom Styling</h3>
                  <IndexAddressCard
                    address={addresses[2]}
                    onClick={handleCardClick}
                    showActions={true}
                    className="border-primary/20 bg-primary/5"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressCardTest;