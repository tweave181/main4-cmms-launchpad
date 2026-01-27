export type WorkRequestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type WorkRequestStatus = 'pending' | 'approved' | 'rejected' | 'converted';

export interface WorkRequest {
  id: string;
  tenant_id: string;
  request_number: string;
  title: string;
  description: string;
  category: string;
  priority: WorkRequestPriority;
  location_id?: string | null;
  location_description?: string | null;
  submitted_by: string;
  status: WorkRequestStatus;
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  work_order_id?: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  location?: { name: string } | null;
  submitter?: { name: string; email: string } | null;
  reviewer?: { name: string } | null;
  work_order?: { work_order_number: string } | null;
}

export interface WorkRequestCategory {
  id: string;
  tenant_id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface WorkRequestFormData {
  title: string;
  description: string;
  category: string;
  priority?: WorkRequestPriority;
  location_id?: string;
  location_description?: string;
}

export interface WorkRequestFilters {
  status?: WorkRequestStatus | 'all';
  category?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
