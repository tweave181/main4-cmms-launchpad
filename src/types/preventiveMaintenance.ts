
export interface PreventiveMaintenanceSchedule {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  instructions?: string;
  frequency_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  frequency_value: number;
  frequency_unit?: 'days' | 'weeks' | 'months' | 'years';
  next_due_date: string;
  last_completed_date?: string;
  is_active: boolean;
  assigned_to?: string;
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

export interface PMScheduleChecklistItem {
  id: string;
  pm_schedule_id: string;
  item_text: string;
  item_type: 'checkbox' | 'value';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PMScheduleFormData {
  name: string;
  description?: string;
  instructions?: string;
  frequency_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  frequency_value: number;
  frequency_unit?: 'days' | 'weeks' | 'months' | 'years';
  next_due_date: string;
  asset_ids: string[];
  assigned_to?: string;
  is_active: boolean;
  checklist_items: Array<{
    item_text: string;
    item_type: 'checkbox' | 'value';
    sort_order: number;
  }>; // Deprecated - kept for backward compatibility
}

export interface PMScheduleWithAssets extends PreventiveMaintenanceSchedule {
  assets?: Array<{
    id: string;
    name: string;
    asset_tag?: string;
  }>;
  assigned_user?: {
    id: string;
    name: string;
    email: string;
  };
  checklist_items?: PMScheduleChecklistItem[]; // Deprecated
  template_items?: Array<{
    id: string;
    template_item_id: string;
    sort_order: number;
    template?: any;
  }>;
}
