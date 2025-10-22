import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import type { ChecklistItemTemplate, ChecklistTemplateFilters, ChecklistTemplateFormData } from '@/types/checklistTemplate';

export const useChecklistTemplates = (filters?: ChecklistTemplateFilters) => {
  return useQuery({
    queryKey: ['checklist-templates', filters],
    queryFn: async () => {
      let query = supabase
        .from('checklist_item_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (filters?.item_type) {
        query = query.eq('item_type', filters.item_type);
      }

      if (filters?.safety_critical !== undefined) {
        query = query.eq('safety_critical', filters.safety_critical);
      }

      if (filters?.search) {
        query = query.or(`item_text.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as ChecklistItemTemplate[];
    },
  });
};

export const useChecklistTemplate = (templateId: string) => {
  return useQuery({
    queryKey: ['checklist-template', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_item_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) throw error;
      return data as ChecklistItemTemplate;
    },
    enabled: !!templateId,
  });
};

export const useTemplateUsage = (templateId: string) => {
  return useQuery({
    queryKey: ['template-usage', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pm_schedule_template_items')
        .select(`
          id,
          pm_schedule_id,
          preventive_maintenance_schedules (
            id,
            name,
            updated_at
          )
        `)
        .eq('template_item_id', templateId);

      if (error) throw error;
      return data;
    },
    enabled: !!templateId,
  });
};

export const useCreateChecklistTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ChecklistTemplateFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userProfile) throw new Error('User profile not found');

      let imageUrl = data.image_url;

      // Upload image if provided
      if (data.image_file) {
        const fileExt = data.image_file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${userProfile.tenant_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('checklist-item-images')
          .upload(filePath, data.image_file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('checklist-item-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { data: template, error } = await supabase
        .from('checklist_item_templates')
        .insert({
          tenant_id: userProfile.tenant_id,
          item_text: data.item_text,
          description: data.description,
          item_type: data.item_type,
          safety_critical: data.safety_critical,
          image_url: imageUrl,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({
        title: 'Success',
        description: 'Checklist item created successfully',
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

export const useUpdateChecklistTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ChecklistTemplateFormData> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: userProfile } = await supabase
        .from('users')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

      if (!userProfile) throw new Error('User profile not found');

      let imageUrl = data.image_url;

      // Upload new image if provided
      if (data.image_file) {
        // Delete old image if exists
        const { data: oldTemplate } = await supabase
          .from('checklist_item_templates')
          .select('image_url')
          .eq('id', id)
          .single();

        if (oldTemplate?.image_url) {
          const oldPath = oldTemplate.image_url.split('/').slice(-2).join('/');
          await supabase.storage
            .from('checklist-item-images')
            .remove([oldPath]);
        }

        const fileExt = data.image_file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${userProfile.tenant_id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('checklist-item-images')
          .upload(filePath, data.image_file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('checklist-item-images')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const updateData: any = {};
      if (data.item_text) updateData.item_text = data.item_text;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.item_type) updateData.item_type = data.item_type;
      if (data.safety_critical !== undefined) updateData.safety_critical = data.safety_critical;
      if (imageUrl) updateData.image_url = imageUrl;

      const { data: template, error } = await supabase
        .from('checklist_item_templates')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return template;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      queryClient.invalidateQueries({ queryKey: ['checklist-template'] });
      toast({
        title: 'Success',
        description: 'Checklist item updated successfully',
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

export const useDeleteChecklistTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Delete associated image if exists
      const { data: template } = await supabase
        .from('checklist_item_templates')
        .select('image_url')
        .eq('id', id)
        .single();

      if (template?.image_url) {
        const path = template.image_url.split('/').slice(-2).join('/');
        await supabase.storage
          .from('checklist-item-images')
          .remove([path]);
      }

      const { error } = await supabase
        .from('checklist_item_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklist-templates'] });
      toast({
        title: 'Success',
        description: 'Checklist item deleted successfully',
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
