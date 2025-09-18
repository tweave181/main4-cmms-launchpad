
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().optional(),
  spare_parts_category_id: z.string().optional(),
  quantity_in_stock: z.number().min(0, "Quantity must be non-negative"),
  reorder_threshold: z.number().min(0, "Reorder threshold must be non-negative"),
  unit_of_measure: z.enum(['pieces', 'kg', 'lbs', 'liters', 'gallons', 'meters', 'feet', 'hours']),
  storage_locations: z.string().optional(),
  linked_asset_type: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;
type InventoryPartData = Omit<Database['public']['Tables']['inventory_parts']['Insert'], 'tenant_id' | 'created_by'>;

interface UseInventoryPartFormProps {
  initialData?: Partial<InventoryPartData>;
  onSubmit: (data: InventoryPartData) => Promise<void>;
}

export const useInventoryPartForm = ({ initialData, onSubmit }: UseInventoryPartFormProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      sku: initialData?.sku || '',
      category: initialData?.category || '',
      spare_parts_category_id: (initialData as any)?.spare_parts_category_id || '',
      quantity_in_stock: initialData?.quantity_in_stock || 0,
      reorder_threshold: initialData?.reorder_threshold || 0,
      unit_of_measure: initialData?.unit_of_measure || 'pieces',
      storage_locations: initialData?.storage_locations?.join(', ') || '',
      linked_asset_type: initialData?.linked_asset_type || '',
    },
  });

  const handleSubmit = async (data: FormData) => {
    const submitData: InventoryPartData = {
      name: data.name,
      sku: data.sku,
      description: data.description || null,
      category: data.category || null,
      spare_parts_category_id: data.spare_parts_category_id || null,
      quantity_in_stock: data.quantity_in_stock,
      reorder_threshold: data.reorder_threshold,
      unit_of_measure: data.unit_of_measure,
      linked_asset_type: data.linked_asset_type || null,
      storage_locations: data.storage_locations 
        ? data.storage_locations.split(',').map(loc => loc.trim()).filter(Boolean)
        : null,
    };
    await onSubmit(submitData);
  };

  return {
    form,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
};
