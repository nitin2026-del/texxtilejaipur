-- Migration to add advanced SEO fields and Blog enhancements

-- 1. Add SEO and Blog metadata columns to public.blogs
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS seo_keywords TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 1;

-- 2. Add SEO metadata columns to public.products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- 3. Seed default blog categories
INSERT INTO public.blog_categories (id, name, slug) VALUES
  ('a0a1a2a3-b4b5-c6c7-d8d9-e0e1e2e3f4f1', 'Style Guide', 'style-guide'),
  ('a0a1a2a3-b4b5-c6c7-d8d9-e0e1e2e3f4f2', 'Heritage', 'heritage'),
  ('a0a1a2a3-b4b5-c6c7-d8d9-e0e1e2e3f4f3', 'Lookbook', 'lookbook'),
  ('a0a1a2a3-b4b5-c6c7-d8d9-e0e1e2e3f4f4', 'Sustainability', 'sustainability')
ON CONFLICT (slug) DO NOTHING;
