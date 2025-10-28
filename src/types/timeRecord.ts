export interface TimeRecord {
  id: string;
  tenant_id: string;
  
  // Parent references
  work_order_id?: string | null;
  pm_schedule_id?: string | null;
  maintenance_job_id?: string | null;
  asset_id?: string | null;
  
  // User and time info
  user_id: string;
  work_date: string;
  hours_worked: number;
  start_time?: string | null;
  end_time?: string | null;
  
  // Work details
  description: string;
  work_type?: string | null;
  
  // Audit
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  
  // Joined data (from queries)
  user?: {
    id: string;
    name: string;
    email: string;
  };
  work_order?: {
    id: string;
    work_order_number: string;
    title: string;
  };
  pm_schedule?: {
    id: string;
    name: string;
  };
  maintenance_job?: {
    id: string;
    name: string;
  };
  asset?: {
    id: string;
    name: string;
    asset_tag?: string;
  };
}

export interface TimeRecordFormData {
  work_date: string;
  hours_worked: number | string;
  start_time?: string;
  end_time?: string;
  description: string;
  work_type?: string;
  
  // Parent entity (at least one required)
  work_order_id?: string;
  pm_schedule_id?: string;
  maintenance_job_id?: string;
  asset_id?: string;
}

export interface TimeRecordFilters {
  user_id?: string;
  work_order_id?: string;
  pm_schedule_id?: string;
  maintenance_job_id?: string;
  asset_id?: string;
  date_from?: string;
  date_to?: string;
  work_type?: string;
}

export interface TimeRecordSummary {
  user_id: string;
  user_name: string;
  total_hours: number;
  record_count: number;
  latest_date: string;
}
