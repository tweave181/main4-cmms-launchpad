export interface Address {
  id: string;
  tenant_id: string;
  address_line_1: string;
  address_line_2?: string;
  address_line_3?: string;
  town_or_city?: string;
  county_or_state?: string;
  postcode?: string;
  company_id?: string | null;
  contact_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
  is_contact?: boolean;
  is_supplier?: boolean;
  is_manufacturer?: boolean;
  is_contractor?: boolean;
  is_other?: boolean;
  created_at: string;
  updated_at: string;
  company_details?: {
    id: string;
    company_name: string;
  } | null;
}

export interface AddressFormData {
  address_line_1: string;
  address_line_2?: string;
  address_line_3?: string;
  town_or_city?: string;
  county_or_state?: string;
  postcode?: string;
  company_id?: string | null;
  contact_name?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
  is_contact?: boolean;
  is_supplier?: boolean;
  is_manufacturer?: boolean;
  is_contractor?: boolean;
  is_other?: boolean;
}

export interface AddressFilters {
  search?: string;
}