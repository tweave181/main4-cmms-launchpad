
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/use-toast';
import type { CompanyDetails, CompanyFormData } from '@/types/company';

export const useCompanies = (type?: string) => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['companies', userProfile?.tenant_id, type],
    queryFn: async () => {
      if (!userProfile?.tenant_id) {
        throw new Error('No tenant found');
      }

      let query = supabase
        .from('company_details')
        .select(`
          *,
          company_address:addresses(*)
        `)
        .eq('tenant_id', userProfile.tenant_id)
        .order('company_name');

      // If filtering by type, join with addresses and filter by address types
      if (type) {
        // Map company types to address boolean fields
        const typeMapping: Record<string, string> = {
          'manufacturer': 'is_manufacturer',
          'contractor': 'is_contractor', 
          'vendor': 'is_supplier',
          'supplier': 'is_supplier',
          'service_provider': 'is_contractor'
        };
        
        const addressField = typeMapping[type];
        if (addressField) {
          query = query.eq(`company_address.${addressField}`, true);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching companies:', error);
        throw error;
      }

      return data as CompanyDetails[];
    },
    enabled: !!userProfile?.tenant_id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async (data: CompanyFormData) => {
      if (!userProfile?.tenant_id || !userProfile?.id) {
        throw new Error('User not authenticated');
      }

      const companyData = {
        company_name: data.company_name,
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone,
        company_address_id: data.company_address_id,
        tenant_id: userProfile.tenant_id,
        created_by: userProfile.id,
      };

      const { data: result, error } = await supabase
        .from('company_details')
        .insert(companyData)
        .select(`
          *,
          company_address:addresses(*)
        `)
        .single();

      if (error) {
        console.error('Error creating company:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Success",
        description: "Company created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Create company error:', error);
      // Don't show toast here since CompanyForm handles it
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyFormData> }) => {
      if (!userProfile?.tenant_id) {
        throw new Error('User not authenticated');
      }

      const updateData = {
        company_name: data.company_name,
        contact_name: data.contact_name,
        email: data.email,
        phone: data.phone,
        company_address_id: data.company_address_id,
      };

      const { data: result, error } = await supabase
        .from('company_details')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          company_address:addresses(*)
        `)
        .single();

      if (error) {
        console.error('Error updating company:', error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Success",
        description: "Company updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Update company error:', error);
      // Don't show toast here since CompanyForm handles it
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('company_details')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting company:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast({
        title: "Success",
        description: "Company deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Delete company error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete company",
        variant: "destructive",
      });
    },
  });
};
