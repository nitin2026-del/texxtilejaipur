-- Add display_order to categories
ALTER TABLE public.categories ADD COLUMN display_order INTEGER DEFAULT 0;
