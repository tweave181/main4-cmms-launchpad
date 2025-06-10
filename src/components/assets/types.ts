
import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

export type Asset = Database['public']['Tables']['assets']['Row'];
export type AssetInsert = Database['public']['Tables']['assets']['Insert'];

export const assetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  asset_tag: z.string().optional(),
  serial_number: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  department_id: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_cost: z.string().optional(),
  warranty_expiry: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'disposed']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  notes: z.string().optional(),
});

export type AssetFormData = z.infer<typeof assetSchema>;
