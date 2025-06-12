
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useDeletePMSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting PM schedule:', id);

      const { error } = await supabase
        .from('preventive_maintenance_schedules')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting PM schedule:', error);
        throw error;
      }

      console.log('PM schedule deleted successfully');
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Preventive maintenance schedule deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['pm-schedules'] });
      queryClient.invalidateQueries({ queryKey: ['pm-schedules-calendar'] });
    },
    onError: (error: any) => {
      console.error('PM schedule deletion error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete PM schedule",
        variant: "destructive",
      });
    },
  });
};
