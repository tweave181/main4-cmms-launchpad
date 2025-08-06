export interface Location {
  id: string;
  tenant_id: string;
  name: string;
  location_code: string;
  description?: string;
  parent_location_id?: string;
  location_level?: string;
  created_at: string;
  updated_at: string;
  parent_location?: Location;
}

export interface LocationFormData {
  name: string;
  location_code?: string;
  description?: string;
  parent_location_id?: string;
  location_level?: string;
}

export interface LocationFilters {
  search?: string;
  parent_location_id?: string;
  location_level?: string;
}

export const LOCATION_LEVELS = [
  'Building',
  'Floor', 
  'Room',
  'Zone',
  'Area',
  'Department'
] as const;

export type LocationLevel = typeof LOCATION_LEVELS[number];