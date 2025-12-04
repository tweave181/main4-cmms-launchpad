import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { showSuccessToast, showErrorToast } from '@/utils/errorHandling';
import { Json } from '@/integrations/supabase/types';

export interface ChecklistRecord {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  asset_type?: string;
  frequency_type?: string;
  is_active: boolean;
  working_days?: string[];
  work_timing?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ChecklistRecordLine {
  id: string;
  checklist_record_id: string;
  checklist_line_id: string;
  sort_order: number;
  created_at: string;
  checklist_item_templates?: {
    id: string;
    item_text: string;
    item_type: string;
    safety_critical: boolean;
    description?: string;
  };
}

export interface ChecklistRecordFormData {
  name: string;
  description?: string;
  asset_type?: string;
  frequency_type?: string;
  is_active: boolean;
  working_days?: string[];
  work_timing?: string;
  line_ids?: string[];
}

// Helper to parse JSON working_days from database
const parseWorkingDays = (data: Json | null): string[] | undefined => {
  if (!data) return undefined;
  if (Array.isArray(data)) return data as string[];
  return undefined;
};

export const useChecklistRecords = () => {
  return useQuery({
    queryKey: ['checklist-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map(record => ({
        ...record,
        working_days: parseWorkingDays(record.working_days),
      })) as ChecklistRecord[];
    },
  });
};

export const useChecklistRecord = (recordId: string) => {
  return useQuery({
    queryKey: ['checklist-record', recordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_records')
        .select('*')
        .eq('id', recordId)
        .single();

      if (error) throw error;
      return {
        ...data,
        working_days: parseWorkingDays(data.working_days),
      } as ChecklistRecord;
    },
    enabled: !!recordId,
  });
};

export const useChecklistRecordLines = (recordId: string) => {
  return useQuery({
    queryKey: ['checklist-record-lines', recordId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_record_lines')
        .select(`
          *,
          checklist_item_templates (
            id,
            item_text,
            item_type,
            safety_critical,
            description
          )
        `)
        .eq('checklist_record_id', recordId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as ChecklistRecordLine[];
    },
    enabled: !!recordId,
  });
};

export const useCreateChecklistRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ChecklistRecordFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userProfile) throw new Error('User profile not found');

      // Create the checklist record
      const { data: record, error } = await supabase
        .from('checklist_records')
        .insert({
          tenant_id: userProfile.tenant_id,
          name: data.name,
          description: data.description,
          asset_type: data.asset_type,
          frequency_type: data.frequency_type,
          is_active: data.is_active,
          working_days: data.working_days as unknown as Json,
          work_timing: data.work_timing,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add checklist lines if provided
      if (data.line_ids && data.line_ids.length > 0) {
        const lines = data.line_ids.map((lineId, index) => ({
          checklist_record_id: record.id,
          checklist_line_id: lineId,
          sort_order: index,
        }));

        const { error: linesError } = await supabase
          .from('checklist_record_lines')
          .insert(lines);

        if (linesError) throw linesError;
      }

      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-records'] });
      showSuccessToast('Checklist record created successfully');
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Create Failed', context: 'Checklist Record' });
    },
  });
};

export const useUpdateChecklistRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ChecklistRecordFormData> }) => {
      const updateData: Record<string, unknown> = {};
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.asset_type !== undefined) updateData.asset_type = data.asset_type;
      if (data.frequency_type !== undefined) updateData.frequency_type = data.frequency_type;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      if (data.working_days !== undefined) updateData.working_days = data.working_days;
      if (data.work_timing !== undefined) updateData.work_timing = data.work_timing;

      const { data: record, error } = await supabase
        .from('checklist_records')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update checklist lines if provided
      if (data.line_ids !== undefined) {
        // Delete existing lines
        await supabase
          .from('checklist_record_lines')
          .delete()
          .eq('checklist_record_id', id);

        // Add new lines
        if (data.line_ids.length > 0) {
          const lines = data.line_ids.map((lineId, index) => ({
            checklist_record_id: id,
            checklist_line_id: lineId,
            sort_order: index,
          }));

          const { error: linesError } = await supabase
            .from('checklist_record_lines')
            .insert(lines);

          if (linesError) throw linesError;
        }
      }

      return record;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-records'] });
      queryClient.invalidateQueries({ queryKey: ['checklist-record', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['checklist-record-lines', variables.id] });
      showSuccessToast('Checklist record updated successfully');
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Update Failed', context: 'Checklist Record' });
    },
  });
};

export const useDeleteChecklistRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('checklist_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-records'] });
      showSuccessToast('Checklist record deleted successfully');
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Delete Failed', context: 'Checklist Record' });
    },
  });
};

export const useAddLinesToRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, lineIds }: { recordId: string; lineIds: string[] }) => {
      // Get current max sort_order
      const { data: existingLines } = await supabase
        .from('checklist_record_lines')
        .select('sort_order')
        .eq('checklist_record_id', recordId)
        .order('sort_order', { ascending: false })
        .limit(1);

      const startOrder = existingLines?.[0]?.sort_order || 0;

      const lines = lineIds.map((lineId, index) => ({
        checklist_record_id: recordId,
        checklist_line_id: lineId,
        sort_order: startOrder + index + 1,
      }));

      const { error } = await supabase
        .from('checklist_record_lines')
        .insert(lines);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-record-lines', variables.recordId] });
      showSuccessToast('Checklist lines added successfully');
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Add Failed', context: 'Checklist Lines' });
    },
  });
};

export const useRemoveLineFromRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ recordId, lineId }: { recordId: string; lineId: string }) => {
      const { error } = await supabase
        .from('checklist_record_lines')
        .delete()
        .eq('id', lineId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['checklist-record-lines', variables.recordId] });
      showSuccessToast('Checklist line removed successfully');
    },
    onError: (error) => {
      showErrorToast(error, { title: 'Remove Failed', context: 'Checklist Line' });
    },
  });
};
