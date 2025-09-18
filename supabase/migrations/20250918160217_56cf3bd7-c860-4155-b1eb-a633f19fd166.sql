-- Create global spare_parts_categories table
CREATE TABLE public.spare_parts_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES public.users(id)
);

-- Enable RLS on spare_parts_categories
ALTER TABLE public.spare_parts_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for spare_parts_categories
CREATE POLICY "Anyone can view active spare parts categories" 
ON public.spare_parts_categories 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can view all spare parts categories" 
ON public.spare_parts_categories 
FOR SELECT 
USING (is_current_user_admin());

CREATE POLICY "Admins can create spare parts categories" 
ON public.spare_parts_categories 
FOR INSERT 
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can update spare parts categories" 
ON public.spare_parts_categories 
FOR UPDATE 
USING (is_current_user_admin())
WITH CHECK (is_current_user_admin());

CREATE POLICY "Admins can delete spare parts categories" 
ON public.spare_parts_categories 
FOR DELETE 
USING (is_current_user_admin());

-- Add spare_parts_category_id column to inventory_parts
ALTER TABLE public.inventory_parts 
ADD COLUMN spare_parts_category_id UUID REFERENCES public.spare_parts_categories(id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_spare_parts_categories_updated_at
  BEFORE UPDATE ON public.spare_parts_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default spare parts categories
INSERT INTO public.spare_parts_categories (name, description, is_active) VALUES
  ('Filters', 'Air, oil, fuel, and other filters', true),
  ('Bearings', 'Ball bearings, roller bearings, and bushings', true),
  ('Belts', 'Drive belts, timing belts, and V-belts', true),
  ('Seals & Gaskets', 'O-rings, gaskets, and sealing components', true),
  ('Fasteners', 'Bolts, screws, nuts, and washers', true),
  ('Electrical', 'Electrical components and wiring', true),
  ('Hydraulic', 'Hydraulic hoses, fittings, and components', true),
  ('Pneumatic', 'Air system components and fittings', true),
  ('Lubricants', 'Oils, greases, and lubricating fluids', true),
  ('Safety', 'Safety equipment and protective gear', true);