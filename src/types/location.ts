export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  location_code: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface LocationFormData {
  name: string;
  location_code?: string;
  description?: string;
}

export interface LocationFilters {
  search?: string;
}