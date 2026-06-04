-- Phase 4: Storage Buckets and Policies

-- Insert Buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('product-images', 'product-images', true),
('blog-images', 'blog-images', true),
('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for Storage Objects
-- Product Images
CREATE POLICY "Public Read Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Admin Write Product Images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Blog Images
CREATE POLICY "Public Read Blog Images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
CREATE POLICY "Admin Write Blog Images" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'blog-images' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Banners
CREATE POLICY "Public Read Banners" ON storage.objects FOR SELECT USING (bucket_id = 'banners');
CREATE POLICY "Admin Write Banners" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'banners' AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
