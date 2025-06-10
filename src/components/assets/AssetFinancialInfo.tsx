
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetFinancialInfoProps {
  asset: Asset;
}

export const AssetFinancialInfo: React.FC<AssetFinancialInfoProps> = ({ asset }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <span>Financial Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium">Purchase Cost</p>
            <p className="text-sm text-gray-600">{formatCurrency(asset.purchase_cost)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium">Purchase Date</p>
            <p className="text-sm text-gray-600">{formatDate(asset.purchase_date)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium">Warranty Expiry</p>
            <p className="text-sm text-gray-600">{formatDate(asset.warranty_expiry)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
