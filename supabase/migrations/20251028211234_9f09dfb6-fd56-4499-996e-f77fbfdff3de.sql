-- Add available_for_time_tracking column to users table
ALTER TABLE public.users 
ADD COLUMN available_for_time_tracking boolean NOT NULL DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.users.available_for_time_tracking IS 
  'Indicates whether this user should appear in time tracking user selection dropdowns. Set to false for users who do not need to log time (e.g., administrative staff, external contacts).';

-- Create index for faster filtering
CREATE INDEX idx_users_available_for_time_tracking 
  ON public.users(available_for_time_tracking) 
  WHERE available_for_time_tracking = true;