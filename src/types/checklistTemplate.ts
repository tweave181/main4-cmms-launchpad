export type ChecklistItemType = 'safety_note' | 'checkbox' | 'to_do' | 'reading';

export interface ChecklistItemTemplate {
  id: string;
  tenant_id: string;
  item_text: string;
  description?: string;
  item_type: ChecklistItemType;
  safety_critical: boolean;
  image_url?: string;
  image_name?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PMScheduleTemplateItem {
  id: string;
  pm_schedule_id: string;
  template_item_id: string;
  sort_order: number;
  created_at: string;
  template?: ChecklistItemTemplate;
}

export interface ChecklistTemplateFormData {
  item_text: string;
  description?: string;
  item_type: ChecklistItemType;
  safety_critical: boolean;
  image_file?: File;
  image_url?: string;
  image_name?: string;
}

export interface ChecklistTemplateFilters {
  search?: string;
  item_type?: ChecklistItemType;
  safety_critical?: boolean;
}
