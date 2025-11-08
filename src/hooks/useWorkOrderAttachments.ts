import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkOrderAttachment {
  id: string;
  work_order_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  created_at: string;
  uploader?: {
    name: string;
  };
}

export const useWorkOrderAttachments = (workOrderId: string) => {
  return useQuery({
    queryKey: ['work-order-attachments', workOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_order_attachments')
        .select(`
          *,
          uploader:uploaded_by(name)
        `)
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkOrderAttachment[];
    },
  });
};

export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      workOrderId,
      file,
      tenantId,
    }: {
      workOrderId: string;
      file: File;
      tenantId: string;
    }) => {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${tenantId}/${workOrderId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('work-order-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Create attachment record
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('work_order_attachments')
        .insert({
          work_order_id: workOrderId,
          tenant_id: tenantId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: userData.user.id,
        })
        .select()
        .single();

      if (error) {
        // Clean up uploaded file if record creation fails
        await supabase.storage.from('work-order-attachments').remove([filePath]);
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['work-order-attachments', variables.workOrderId],
      });
      toast({
        title: 'Success',
        description: 'File uploaded successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      attachmentId,
      filePath,
      workOrderId,
    }: {
      attachmentId: string;
      filePath: string;
      workOrderId: string;
    }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('work-order-attachments')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete record
      const { error } = await supabase
        .from('work_order_attachments')
        .delete()
        .eq('id', attachmentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['work-order-attachments', variables.workOrderId],
      });
      toast({
        title: 'Success',
        description: 'Attachment deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDownloadAttachment = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      filePath,
      fileName,
    }: {
      filePath: string;
      fileName: string;
    }) => {
      const { data, error } = await supabase.storage
        .from('work-order-attachments')
        .download(filePath);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    onError: (error: Error) => {
      toast({
        title: 'Download failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
