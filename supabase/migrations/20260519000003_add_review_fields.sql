-- Add new fields to support custom styled reviews
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS reviewer_name TEXT,
ADD COLUMN IF NOT EXISTS reviewer_location TEXT,
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS reply TEXT,
ADD COLUMN IF NOT EXISTS is_verified_buyer BOOLEAN DEFAULT false;

-- Allow users (including guests) to insert reviews
CREATE POLICY "Anyone can insert reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (true);
