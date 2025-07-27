-- Create enum for comment status
CREATE TYPE comment_status AS ENUM ('open', 'closed');

-- Add new fields to work_order_comments table
ALTER TABLE public.work_order_comments 
ADD COLUMN comment_status comment_status DEFAULT 'open',
ADD COLUMN comment_time_created timestamp with time zone DEFAULT now(),
ADD COLUMN comment_time_worked text,
ADD COLUMN comment_time_closed timestamp with time zone;