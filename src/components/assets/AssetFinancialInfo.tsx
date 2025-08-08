
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar } from 'lucide-react';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import type { Database } from '@/integrations/supabase/types';

type Asset = Database['public']['Tables']['assets']['Row'];

interface AssetFinancialInfoProps {
  asset: Asset;
}

export const AssetFinancialInfo: React.FC<AssetFinancialInfoProps> = ({ asset }) => {
  const { formatDate, formatCurrency } = useGlobalSettings();

  const formatDateSafely = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return formatDate(dateString);
  };

  const formatCurrencySafely = (amount: number | null) => {
    if (!amount) return 'Not specified';
    return formatCurrency(amount);
  };

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <span>Financial Information</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium">Purchase Cost</p>
            <p className="text-sm text-gray-600">{formatCurrencySafely(asset.purchase_cost)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium">Purchase Date</p>
            <p className="text-sm text-gray-600">{formatDateSafely(asset.purchase_date)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <div>
            <p className="text-sm font-medium">Warranty Expiry</p>
            <p className="text-sm text-gray-600">{formatDateSafely(asset.warranty_expiry)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
