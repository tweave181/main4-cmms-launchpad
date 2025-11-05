
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { normalizeDropdownData, type DropdownState } from '../utils/dropdownHelpers';
import { logError } from '@/utils/errorHandling';

export const useAssetDropdownData = () => {
  const { userProfile } = useAuth();

  const departments = useQuery({
    queryKey: ['departments', userProfile?.tenant_id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, name')
          .order('name');

        if (error) throw error;
        return normalizeDropdownData(data || []);
      } catch (error) {
        logError(error, 'useAssetDropdownData:Departments');
        return [];
      }
    },
    enabled: !!userProfile?.tenant_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const locations = useQuery({
    queryKey: ['locations', userProfile?.tenant_id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, name')
          .order('name');

        if (error) throw error;
        return normalizeDropdownData(data || []);
      } catch (error) {
        logError(error, 'useAssetDropdownData:Locations');
        return [];
      }
    },
    enabled: !!userProfile?.tenant_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const serviceContracts = useQuery({
    queryKey: ['service-contracts', userProfile?.tenant_id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('service_contracts')
          .select('id, contract_title')
          .eq('status', 'Active')
          .order('contract_title');

        if (error) throw error;
        return normalizeDropdownData(data?.map(item => ({
          id: item.id,
          name: item.contract_title,
        })) || []);
      } catch (error) {
        logError(error, 'useAssetDropdownData:ServiceContracts');
        return [];
      }
    },
    enabled: !!userProfile?.tenant_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const companies = useQuery({
    queryKey: ['companies', userProfile?.tenant_id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('company_details')
          .select(`
            id,
            company_name,
            company_address:addresses!inner(
              is_manufacturer
            )
          `)
          .eq('tenant_id', userProfile.tenant_id)
          .eq('company_address.is_manufacturer', true)
          .order('company_name');

        if (error) throw error;
        return normalizeDropdownData(data?.map(item => ({
          id: item.id,
          name: item.company_name,
        })) || []);
      } catch (error) {
        logError(error, 'useAssetDropdownData:Manufacturers');
        return [];
      }
    },
    enabled: !!userProfile?.tenant_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    departments: {
      data: departments.data || [],
      isLoading: departments.isLoading,
      error: departments.error,
    } as DropdownState,
    locations: {
      data: locations.data || [],
      isLoading: locations.isLoading,
      error: locations.error,
    } as DropdownState,
    serviceContracts: {
      data: serviceContracts.data || [],
      isLoading: serviceContracts.isLoading,
      error: serviceContracts.error,
    } as DropdownState,
    companies: {
      data: companies.data || [],
      isLoading: companies.isLoading,
      error: companies.error,
    } as DropdownState,
  };
};
