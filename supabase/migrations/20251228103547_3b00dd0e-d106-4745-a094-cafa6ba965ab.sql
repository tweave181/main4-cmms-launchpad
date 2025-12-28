-- Add Site Address and Main Contact fields to program_settings
ALTER TABLE public.program_settings
  -- Site Address fields
  ADD COLUMN site_address_line_1 text,
  ADD COLUMN site_address_line_2 text,
  ADD COLUMN site_address_line_3 text,
  ADD COLUMN site_town_or_city text,
  ADD COLUMN site_county_or_state text,
  ADD COLUMN site_postcode text,
  -- Main Contact fields
  ADD COLUMN main_contact_first_name text,
  ADD COLUMN main_contact_surname text,
  ADD COLUMN main_contact_job_title text,
  ADD COLUMN main_contact_phone text,
  ADD COLUMN main_contact_mobile text,
  ADD COLUMN main_contact_email text,
  ADD COLUMN main_contact_department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL;