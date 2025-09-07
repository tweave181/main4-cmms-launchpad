
import type { Address } from './address';

export interface CompanyDetails {
  id: string;
  tenant_id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  company_website?: string;
  company_description?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

import type { AddressFormData } from './address';

export interface CompanyFormData {
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  company_website?: string;
  company_description?: string;
}

