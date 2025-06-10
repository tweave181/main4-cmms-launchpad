
export interface WorkOrder {
  id: string;
  tenant_id: string;
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
}

export interface WorkOrderFilters {
  status?: string;
  priority?: string;
  work_type?: string;
  assigned_to?: string;
  search?: string;
}
