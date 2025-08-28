export interface LocationLevel {
  id: string;
  tenant_id: string;
  name: string;
  code?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  usage_count?: number;
}

export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  location_code: string;
  description?: string;
  parent_location_id?: string;
  location_level?: string; // Legacy field
  location_level_id?: string;
  created_at: string;
  updated_at: string;
  parent_location?: Location;
  location_level_data?: LocationLevel;
}

export interface LocationFormData {
  name: string;
  location_code?: string;
  description?: string;
  parent_location_id?: string;
  location_level_id: string;
}

export interface LocationLevelFormData {
  name: string;
  code?: string;
  is_active?: boolean;
}

export interface LocationFilters {
  search?: string;
  parent_location_id?: string;
  location_level_id?: string;
}

export interface LocationLevelFilters {
  search?: string;
  is_active?: boolean;
  includeUsage?: boolean;
}