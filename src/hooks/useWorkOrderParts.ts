import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkOrderPartUsage {
  id: string;
  work_order_id: string;
  part_id: string;
  quantity_used: number;
  created_at: string;
  tenant_id: string;
  part?: {
    id: string;
    name: string;
    sku: string;
    quantity_in_stock: number;
    unit_of_measure: string;
  };
}

export const useWorkOrderParts = (workOrderId: string) => {
  return useQuery({
    queryKey: ['work-order-parts', workOrderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('part_work_order_usage')
        .select(`
          *,
          part:part_id(
            id,
            name,
            sku,
            quantity_in_stock,
            unit_of_measure
          )
        `)
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as WorkOrderPartUsage[];
    },
  });
};

export const useAddPartToWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      workOrderId,
      partId,
      quantityUsed,
      tenantId,
    }: {
      workOrderId: string;
      partId: string;
      quantityUsed: number;
      tenantId: string;
    }) => {
      // First check current stock
      const { data: partData, error: partError } = await supabase
        .from('inventory_parts')
        .select('quantity_in_stock, name')
        .eq('id', partId)
        .single();

      if (partError) throw partError;

      if (partData.quantity_in_stock < quantityUsed) {
        throw new Error(
          `Insufficient stock for ${partData.name}. Available: ${partData.quantity_in_stock}`
        );
      }

      const { data, error } = await supabase
        .from('part_work_order_usage')
        .insert({
          work_order_id: workOrderId,
          part_id: partId,
          quantity_used: quantityUsed,
          tenant_id: tenantId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['work-order-parts', variables.workOrderId],
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      toast({
        title: 'Success',
        description: 'Part added to work order',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add part',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useBulkAddPartsToWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      workOrderId,
      parts,
      tenantId,
    }: {
      workOrderId: string;
      parts: Array<{ partId: string; quantity: number }>;
      tenantId: string;
    }) => {
      // Validate all parts have sufficient stock
      const stockChecks = await Promise.all(
        parts.map(async (part) => {
          const { data, error } = await supabase
            .from('inventory_parts')
            .select('quantity_in_stock, name')
            .eq('id', part.partId)
            .single();

          if (error) throw error;

          if (data.quantity_in_stock < part.quantity) {
            throw new Error(
              `Insufficient stock for ${data.name}. Requested: ${part.quantity}, Available: ${data.quantity_in_stock}`
            );
          }

          return { partId: part.partId, name: data.name };
        })
      );

      // Insert all parts
      const insertData = parts.map((part) => ({
        work_order_id: workOrderId,
        part_id: part.partId,
        quantity_used: part.quantity,
        tenant_id: tenantId,
      }));

      const { data, error } = await supabase
        .from('part_work_order_usage')
        .insert(insertData)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['work-order-parts', variables.workOrderId],
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      toast({
        title: 'Success',
        description: `${variables.parts.length} part${variables.parts.length !== 1 ? 's' : ''} added to work order`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to add parts',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePartUsage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      usageId,
      quantityUsed,
      workOrderId,
    }: {
      usageId: string;
      quantityUsed: number;
      workOrderId: string;
    }) => {
      const { data, error } = await supabase
        .from('part_work_order_usage')
        .update({ quantity_used: quantityUsed })
        .eq('id', usageId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['work-order-parts', variables.workOrderId],
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      toast({
        title: 'Success',
        description: 'Part quantity updated',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update quantity',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useRemovePartFromWorkOrder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      usageId,
      workOrderId,
    }: {
      usageId: string;
      workOrderId: string;
    }) => {
      const { error } = await supabase
        .from('part_work_order_usage')
        .delete()
        .eq('id', usageId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['work-order-parts', variables.workOrderId],
      });
      queryClient.invalidateQueries({ queryKey: ['inventory-parts'] });
      toast({
        title: 'Success',
        description: 'Part removed from work order',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to remove part',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
