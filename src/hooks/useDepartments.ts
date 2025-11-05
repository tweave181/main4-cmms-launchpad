
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { handleError, showSuccessToast } from '@/utils/errorHandling';
import type { Database } from '@/integrations/supabase/types';

type Department = Database['public']['Tables']['departments']['Row'];

export const useDepartments = () => {
  const { userProfile } = useAuth();

  const { data: departments, isLoading, refetch } = useQuery({
    queryKey: ['departments', userProfile?.tenant_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Department[];
    },
    enabled: !!userProfile?.tenant_id,
  });

  const deleteDepartment = async (departmentId: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;

    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', departmentId);

      if (error) throw error;

      showSuccessToast("Department deleted successfully");
      refetch();
    } catch (error) {
      handleError(error, 'useDepartments.deleteDepartment', {
        showToast: true,
        toastTitle: 'Delete Failed',
        additionalData: { departmentId }
      });
    }
  };

  return {
    departments: departments || [],
    isLoading,
    refetch,
    deleteDepartment,
  };
};
