-- Setup Storage Buckets for Hiya Wear

-- 1. Product Images Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Product Images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Insert Access" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE USING (
  bucket_id = 'product-images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Blog Images Bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Blog Images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Admin/Editor Insert Access" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'blog-images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'editor'))
);


-- ==========================================
-- SAMPLE SEED DATA
-- ==========================================

-- Categories
INSERT INTO public.categories (name, slug, description) VALUES
('Embroidered Jackets', 'embroidered-jackets', 'Vintage and handmade embroidered jackets.'),
('Boho Dresses', 'boho-dresses', 'Free flowing bohemian style dresses.'),
('Banarasi Silk', 'banarasi-silk', 'Premium Banarasi silk garments.')
ON CONFLICT (slug) DO NOTHING;

-- Collections
INSERT INTO public.collections (name, slug, description, is_featured) VALUES
('Summer Boho Collection', 'summer-boho', 'Light and breezy for the summer.', true),
('Royal Wedding Edit', 'royal-wedding', 'Luxury traditional wear for occasions.', true)
ON CONFLICT (slug) DO NOTHING;

-- Mock Products (Requires getting Category IDs, using DO block to link)
DO $$
DECLARE
  cat_jacket UUID;
  cat_boho UUID;
  col_summer UUID;
BEGIN
  SELECT id INTO cat_jacket FROM public.categories WHERE slug = 'embroidered-jackets';
  SELECT id INTO cat_boho FROM public.categories WHERE slug = 'boho-dresses';
  SELECT id INTO col_summer FROM public.collections WHERE slug = 'summer-boho';

  -- Product 1
  INSERT INTO public.products (sku, name, slug, description, category_id, collection_id, price_inr, price_usd, price_eur, price_gbp, price_aud, stock_quantity, is_featured)
  VALUES (
    'HW-JAC-001', 'Vintage Suzani Embroidered Jacket', 'vintage-suzani-jacket', 
    'Hand-embroidered Suzani jacket with intricate floral patterns. Crafted by artisans in Jaipur.',
    cat_jacket, col_summer, 
    4500.00, 75.00, 68.00, 58.00, 110.00, 
    15, true
  ) ON CONFLICT (slug) DO NOTHING;

  -- Product 2
  INSERT INTO public.products (sku, name, slug, description, category_id, collection_id, price_inr, price_usd, price_eur, price_gbp, price_aud, stock_quantity)
  VALUES (
    'HW-DRE-002', 'Indigo Block Print Maxi Dress', 'indigo-block-print-maxi', 
    'Pure cotton maxi dress with traditional indigo block printing techniques.',
    cat_boho, col_summer, 
    2800.00, 45.00, 41.00, 35.00, 65.00, 
    30
  ) ON CONFLICT (slug) DO NOTHING;
END $$;
