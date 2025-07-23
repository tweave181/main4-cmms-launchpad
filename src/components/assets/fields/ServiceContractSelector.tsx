
import React from 'react';
import { Control } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useGlobalSettings } from '@/contexts/GlobalSettingsContext';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Building2 } from 'lucide-react';
import type { AssetFormData } from '../types';

interface ServiceContractSelectorProps {
  control: Control<AssetFormData>;
}

interface ServiceContract {
  id: string;
  contract_title: string;
  vendor_name: string;
  status: string;
  start_date: string;
  end_date: string;
  contract_cost: number | null;
  company_details?: {
    company_name: string;
    email: string | null;
    phone: string | null;
  } | null;
}

export const ServiceContractSelector: React.FC<ServiceContractSelectorProps> = ({ control }) => {
  const { userProfile } = useAuth();
  const { formatDate, formatCurrency } = useGlobalSettings();

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['service-contracts', userProfile?.tenant_id],
    queryFn: async () => {
      if (!userProfile?.tenant_id) return [];

      const { data, error } = await supabase
        .from('service_contracts')
        .select(`
          id,
          contract_title,
          vendor_name,
          status,
          start_date,
          end_date,
          contract_cost,
          company_details:company_details(company_name, email, phone)
        `)
        .eq('tenant_id', userProfile.tenant_id)
        .order('contract_title');

      if (error) throw error;
      return data as ServiceContract[];
    },
    enabled: !!userProfile?.tenant_id,
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      case 'pending review': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isContractActive = (contract: ServiceContract) => {
    const today = new Date();
    const endDate = new Date(contract.end_date);
    return contract.status === 'Active' && endDate >= today;
  };

  return (
    <FormField
      control={control}
      name="service_contract_id"
      render={({ field }) => {
        const selectedContract = contracts.find(c => c.id === field.value);
        
        return (
          <FormItem className="space-y-3">
            <FormLabel>Service Contract</FormLabel>
            <FormControl>
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a service contract (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No service contract</SelectItem>
                  {contracts.map((contract) => (
                    <SelectItem
                      key={contract.id}
                      value={contract.id}
                      disabled={!isContractActive(contract)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={!isContractActive(contract) ? 'text-gray-500' : ''}>
                          {contract.contract_title}
                        </span>
                        <Badge 
                          className={`ml-2 ${getStatusColor(contract.status)}`}
                          variant="secondary"
                        >
                          {contract.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>

            {selectedContract && (
              <Card className="border-muted-foreground/20 bg-muted/10">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Contract Details</h4>
                    <Badge 
                      className={getStatusColor(selectedContract.status)}
                      variant="secondary"
                    >
                      {selectedContract.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Vendor:</span>
                      <span>{selectedContract.company_details?.company_name || selectedContract.vendor_name}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">End Date:</span>
                      <span>{formatDate(selectedContract.end_date)}</span>
                    </div>
                    
                    {selectedContract.contract_cost && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Value:</span>
                        <span>{formatCurrency(selectedContract.contract_cost)}</span>
                      </div>
                    )}
                  </div>

                  {!isContractActive(selectedContract) && (
                    <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                      ⚠️ This contract is {selectedContract.status.toLowerCase()} or expired and cannot be assigned to new assets.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};
