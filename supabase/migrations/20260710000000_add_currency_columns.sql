-- Add display_currency and total_display_currency to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS display_currency TEXT DEFAULT 'INR',
ADD COLUMN IF NOT EXISTS total_display_currency TEXT;
