
export interface WorkOrder {
  id: string;
  tenant_id: string;
  work_order_number: string;
  title: string;
  description?: string;
  asset_id?: string;
  assigned_to?: string;
  created_by?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  work_type: 'corrective' | 'preventive' | 'emergency' | 'inspection';
  estimated_hours?: number;
  actual_hours?: number;
  estimated_cost?: number;
  actual_cost?: number;
  due_date?: string;
  completed_at?: string;
  assigned_to_contractor?: boolean;
  contractor_company_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderComment {
  id: string;
  work_order_id: string;
  user_id: string;
  comment: string;
  comment_type: 'comment' | 'status_change' | 'assignment' | 'time_log';
  created_at: string;
}

export interface WorkOrderFormData {
  title: string;
  description?: string;
  asset_id?: string;
  assigned_to?: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  work_type: 'corrective' | 'preventive' | 'emergency' | 'inspection';
  estimated_hours?: string;
  estimated_cost?: string;
  due_date?: string;
  assigned_to_contractor?: boolean;
  contractor_company_id?: string;
  work_order_number?: string; // Optional for forms, will be auto-generated
}

// Updated WorkOrderFilters to use valid enum values or undefined (never empty strings)
export interface WorkOrderFilters {
  status?: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  work_type?: 'corrective' | 'preventive' | 'emergency' | 'inspection';
  assigned_to?: string;
  search?: string;
}
