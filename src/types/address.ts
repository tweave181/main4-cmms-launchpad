export interface Address {
  id: string;
  tenant_id: string;
  address_line_1: string;
  address_line_2?: string;
  address_line_3?: string;
  town_or_city?: string;
  county_or_state?: string;
  postcode?: string;
  created_at: string;
  updated_at: string;
}

export interface AddressFormData {
  address_line_1: string;
  address_line_2?: string;
  address_line_3?: string;
  town_or_city?: string;
  county_or_state?: string;
  postcode?: string;
}

export interface AddressFilters {
  search?: string;
}