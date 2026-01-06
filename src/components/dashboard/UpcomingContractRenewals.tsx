import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUpcomingContractRenewals } from '@/hooks/useUpcomingContractRenewals';
import { formatDistanceToNow } from 'date-fns';
export const UpcomingContractRenewals: React.FC = () => {
  const navigate = useNavigate();
  const {
    renewals,
    isLoading,
    error
  } = useUpcomingContractRenewals();
  const getDaysUntilExpiry = (endDate: string) => {
    const today = new Date();
    const expiryDate = new Date(endDate);
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const getExpiryColorClass = (endDate: string) => {
    const days = getDaysUntilExpiry(endDate);
    if (days <= 7) return 'text-red-600 bg-red-50 border-red-200';
    if (days <= 14) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };
  if (isLoading) {
    return <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-2xl font-semibold">Upcoming Contract Renewals</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>)}
          </div>
        </CardContent>
      </Card>;
  }
  if (error) {
    return <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
        <CardHeader className="p-0 mb-4">
          <CardTitle className="text-2xl font-semibold">Upcoming Contract Renewals</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center py-4 text-gray-500">
            Unable to load contract renewals
          </div>
        </CardContent>
      </Card>;
  }
  return <Card className="rounded-2xl shadow-md border border-gray-200 p-6">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="text-2xl font-semibold flex items-center">
          <FileText className="w-6 h-6 mr-2 text-primary" />
          Upcoming Contract Renewals
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {renewals.length === 0 ? <div className="text-center py-4">
            <div className="text-lg text-green-600 mb-1">✅</div>
            <p className="text-gray-600">No contracts expiring in the next 30 days.</p>
          </div> : <div className="space-y-4">
            {renewals.map(contract => <div key={contract.id} className={`p-4 rounded-lg border ${getExpiryColorClass(contract.end_date)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-base mb-1">
                      {contract.contract_title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {contract.vendor_name}
                    </p>
                    <div className="flex items-center text-sm">
                      <span className="mr-4">
                        Expires {formatDistanceToNow(new Date(contract.end_date), {
                    addSuffix: true
                  })}
                      </span>
                      {contract.asset_count !== undefined && contract.asset_count > 0 && <span className="flex items-center text-gray-500">
                          <Building2 className="w-4 h-4 mr-1" />
                          {contract.asset_count} asset{contract.asset_count !== 1 ? 's' : ''}
                        </span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {getDaysUntilExpiry(contract.end_date)} days
                    </div>
                  </div>
                </div>
              </div>)}
          </div>}
        
        <div className="mt-4">
          <Button variant="outline" onClick={() => navigate('/admin/service-contracts')} className="w-full rounded-2xl bg-slate-400 hover:bg-slate-300">
            <ExternalLink className="w-4 h-4 mr-2" />
            View All Service Contracts
          </Button>
        </div>
      </CardContent>
    </Card>;
};