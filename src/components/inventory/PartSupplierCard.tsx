import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Edit, X, ExternalLink } from 'lucide-react';
import { SupplierSelector } from './SupplierSelector';

interface PartSupplierCardProps {
  supplier?: {
    id: string;
    company_name: string | null;
    contact_name: string | null;
    address_line_1: string;
  };
  isEditing: boolean;
  onSupplierChange: (supplierId: string | null) => void;
}

export const PartSupplierCard: React.FC<PartSupplierCardProps> = ({
  supplier,
  isEditing,
  onSupplierChange,
}) => {
  const [showSelector, setShowSelector] = useState(false);

  const handleSupplierSelect = (supplierId: string | null) => {
    onSupplierChange(supplierId);
    setShowSelector(false);
  };

  const handleClearSupplier = () => {
    onSupplierChange(null);
  };

  const openAddressDetail = () => {
    // TODO: Navigate to address detail page when implemented
    console.log('Navigate to address detail:', supplier?.id);
  };

  return (
    <Card className="rounded-2xl shadow-sm border border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          Supplier
        </CardTitle>
      </CardHeader>
      <CardContent>
        {supplier ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="font-medium">
                  {supplier.company_name || 'Unknown Company'}
                </div>
                {supplier.contact_name && (
                  <div className="text-sm text-muted-foreground">
                    Contact: {supplier.contact_name}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  {supplier.address_line_1}
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openAddressDetail}
                  className="p-1"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            {isEditing && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSelector(true)}
                  className="text-xs"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Change
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearSupplier}
                  className="text-xs text-destructive hover:text-destructive"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              No supplier assigned
            </div>
            {isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSelector(true)}
                className="text-xs"
              >
                <Building2 className="h-3 w-3 mr-1" />
                Select Supplier
              </Button>
            )}
          </div>
        )}

        {showSelector && (
          <div className="mt-4">
            <SupplierSelector
              onSelect={handleSupplierSelect}
              onCancel={() => setShowSelector(false)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};