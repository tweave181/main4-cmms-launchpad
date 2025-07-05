
import { z } from 'zod';

export interface Asset {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  asset_tag?: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  manufacturer_company_id?: string;
  category?: string;
  location_id?: string;
  department_id?: string;
  purchase_date?: string;
  purchase_cost?: number;
  warranty_expiry?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'disposed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface AssetFormData {
  name: string;
  description?: string;
  asset_tag?: string;
  serial_number?: string;
  model?: string;
  manufacturer?: string;
  manufacturer_company_id?: string;
  category?: string;
  location_id?: string;
  department_id?: string;
  purchase_date?: string;
  purchase_cost?: string;
  warranty_expiry?: string;
  status: 'active' | 'inactive' | 'maintenance' | 'disposed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
}

export interface AssetInsert {
  name: string;
  description?: string | null;
  asset_tag?: string | null;
  serial_number?: string | null;
  model?: string | null;
  manufacturer?: string | null;
  manufacturer_company_id?: string | null;
  category?: string | null;
  location_id?: string | null;
  department_id?: string | null;
  purchase_date?: string | null;
  purchase_cost?: number | null;
  warranty_expiry?: string | null;
  status: 'active' | 'inactive' | 'maintenance' | 'disposed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string | null;
  tenant_id: string;
  created_by?: string;
  updated_by?: string;
}

export const assetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  description: z.string().optional(),
  asset_tag: z.string().optional(),
  serial_number: z.string().optional(),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  manufacturer_company_id: z.string().optional(),
  category: z.string().optional(),
  location_id: z.string().optional(),
  department_id: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_cost: z.string().optional(),
  warranty_expiry: z.string().optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'disposed']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  notes: z.string().optional(),
});
