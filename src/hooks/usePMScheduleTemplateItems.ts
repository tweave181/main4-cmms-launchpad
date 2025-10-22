import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { PMScheduleTemplateItem } from '@/types/checklistTemplate';

export const usePMScheduleTemplateItems = (scheduleId: string) => {
  return useQuery({
    queryKey: ['pm-schedule-template-items', scheduleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pm_schedule_template_items')
        .select(`
          *,
          template:checklist_item_templates(*)
        `)
        .eq('pm_schedule_id', scheduleId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as PMScheduleTemplateItem[];
    },
    enabled: !!scheduleId,
  });
};

export const useAddTemplateItemsToSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scheduleId, templateIds }: { scheduleId: string; templateIds: string[] }) => {
      // Get current max sort_order
      const { data: existingItems } = await supabase
        .from('pm_schedule_template_items')
        .select('sort_order')
        .eq('pm_schedule_id', scheduleId)
        .order('sort_order', { ascending: false })
        .limit(1);

      const startOrder = existingItems?.[0]?.sort_order || 0;

      const items = templateIds.map((templateId, index) => ({
        pm_schedule_id: scheduleId,
        template_item_id: templateId,
        sort_order: startOrder + index + 1,
      }));

      const { error } = await supabase
        .from('pm_schedule_template_items')
        .insert(items);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pm-schedule-template-items', variables.scheduleId] });
      queryClient.invalidateQueries({ queryKey: ['pm-schedule', variables.scheduleId] });
      toast({
        title: 'Success',
        description: 'Checklist items added to schedule',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useRemoveTemplateItemFromSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scheduleId, itemId }: { scheduleId: string; itemId: string }) => {
      const { error } = await supabase
        .from('pm_schedule_template_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pm-schedule-template-items', variables.scheduleId] });
      queryClient.invalidateQueries({ queryKey: ['pm-schedule', variables.scheduleId] });
      toast({
        title: 'Success',
        description: 'Checklist item removed from schedule',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useReorderTemplateItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ scheduleId, items }: { scheduleId: string; items: Array<{ id: string; sort_order: number }> }) => {
      const updates = items.map(item =>
        supabase
          .from('pm_schedule_template_items')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id)
      );

      await Promise.all(updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pm-schedule-template-items', variables.scheduleId] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: 'Failed to reorder items',
        variant: 'destructive',
      });
    },
  });
};
