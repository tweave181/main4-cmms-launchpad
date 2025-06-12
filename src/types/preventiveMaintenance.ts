
export interface PreventiveMaintenanceSchedule {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  instructions?: string;
  frequency_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  frequency_value: number;
  frequency_unit?: 'days' | 'weeks' | 'months';
  next_due_date: string;
  last_completed_date?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PMScheduleAsset {
  id: string;
  pm_schedule_id: string;
  asset_id: string;
  created_at: string;
}

export interface PMScheduleFormData {
  name: string;
  description?: string;
  instructions?: string;
  frequency_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  frequency_value: number;
  frequency_unit?: 'days' | 'weeks' | 'months';
  next_due_date: string;
  asset_ids: string[];
  is_active: boolean;
}

export interface PMScheduleWithAssets extends PreventiveMaintenanceSchedule {
  assets?: Array<{
    id: string;
    name: string;
    asset_tag?: string;
  }>;
}
