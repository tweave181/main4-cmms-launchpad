export interface AddressContact {
  id: string;
  address_id: string;
  title?: string;
  name: string;
  job_title?: string;
  department?: string;
  telephone?: string;
  extension?: string;
  mobile?: string;
  email?: string;
  general_notes?: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface AddressContactFormData {
  title?: string;
  name: string;
  job_title?: string;
  department?: string;
  telephone?: string;
  extension?: string;
  mobile?: string;
  email?: string;
  general_notes?: string;
}