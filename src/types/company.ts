
export interface CompanyDetails {
  id: string;
  tenant_id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  type: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CompanyFormData {
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  type: string[];
}

export const COMPANY_TYPES = [
  'manufacturer',
  'contractor',
  'vendor',
  'supplier',
  'service_provider'
] as const;

export type CompanyType = typeof COMPANY_TYPES[number];
