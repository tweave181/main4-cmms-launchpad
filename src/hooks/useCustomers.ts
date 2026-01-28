import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { Customer, CustomerFormData } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';

export const useCustomers = () => {
  const { userProfile } = useAuth();

  return useQuery({
    queryKey: ['customers', userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          department:departments(name),
          job_title:job_titles(title_name),
          work_area:locations(name),
          supervisor:customers!customers_reports_to_fkey(name)
        `)
        .order('name');

      if (error) throw error;
      return data as unknown as Customer[];
    },
    enabled: !!userProfile?.tenant_id,
  });
};

export const useCustomer = (id: string | undefined) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          department:departments(name),
          job_title:job_titles(title_name),
          work_area:locations(name),
          supervisor:customers!customers_reports_to_fkey(name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as unknown as Customer | null;
    },
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { userProfile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: CustomerFormData) => {
      if (!userProfile?.tenant_id) {
        throw new Error('Tenant not found');
      }

      // Call edge function to hash password and create customer
      const { data, error } = await supabase.functions.invoke('customer-auth', {
        body: {
          action: 'create',
          tenant_id: userProfile.tenant_id,
          ...formData,
        },
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Failed to create customer');
      }

      return data.customer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Customer Created',
        description: 'The customer account has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...formData }: CustomerFormData & { id: string }) => {
      // If password is provided, use edge function to hash it
      if (formData.password) {
        const { data, error } = await supabase.functions.invoke('customer-auth', {
          body: {
            action: 'update',
            customer_id: id,
            ...formData,
          },
        });

        if (error || !data?.success) {
          throw new Error(data?.error || error?.message || 'Failed to update customer');
        }

        return data.customer;
      }

      // Otherwise, update directly (without password)
      const { password, ...updateData } = formData;
      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      toast({
        title: 'Customer Updated',
        description: 'The customer account has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: 'Customer Deleted',
        description: 'The customer account has been deleted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
