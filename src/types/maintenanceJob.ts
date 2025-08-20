export interface MaintenanceJob {
  id: string;
  tenant_id: string;
  pm_schedule_id?: string;
  asset_id?: string;
  assigned_to?: string;
  work_order_id?: string;
  
  name: string;
  description?: string;
  instructions?: string;
  
  status: 'open' | 'in_progress' | 'overdue' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  due_date: string;
  completed_at?: string;
  
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  assigned_user?: {
    id: string;
    name: string;
    email: string;
  };
  asset?: {
    id: string;
    name: string;
    asset_tag?: string;
  };
  work_order?: {
    id: string;
    work_order_number: string;
  };
  pm_schedule?: {
    id: string;
    name: string;
  };
}

export interface MaintenanceJobFilters {
  asset_id?: string;
  status?: string;
  assigned_to?: string;
  priority?: string;
  due_date_from?: string;
  due_date_to?: string;
}

export interface MaintenanceJobFormData {
  name: string;
  description?: string;
  instructions?: string;
  status: 'open' | 'in_progress' | 'overdue' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string;
  asset_id?: string;
  assigned_to?: string;
  work_order_id?: string;
}