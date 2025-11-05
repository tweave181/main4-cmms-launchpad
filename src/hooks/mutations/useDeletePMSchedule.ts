
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/utils/errorHandling';

export const useDeletePMSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting PM schedule:', id);

      const { error } = await supabase
        .from('preventive_maintenance_schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('PM schedule deleted successfully');
    },
    onSuccess: () => {
      showSuccessToast("Preventive maintenance schedule deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['pm-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['pm-schedules-calendar'] });
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Delete Failed', context: 'PM Schedule' });
    },
  });
};
