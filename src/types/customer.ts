export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  phone_extension: string | null;
  department_id: string | null;
  job_title_id: string | null;
  work_area_id: string | null;
  reports_to: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined fields
  department?: { name: string } | null;
  job_title?: { title_name: string } | null;
  work_area?: { name: string } | null;
  supervisor?: { name: string } | null;
}

export interface CustomerFormData {
  name: string;
  email?: string;
  phone?: string;
  phone_extension?: string;
  department_id?: string;
  job_title_id?: string;
  work_area_id?: string;
  reports_to?: string;
  password?: string;
  is_active?: boolean;
}

export interface CustomerLoginCredentials {
  name: string;
  password: string;
  tenant_id: string;
}

export interface CustomerSession {
  customer: Customer;
  token: string;
}
