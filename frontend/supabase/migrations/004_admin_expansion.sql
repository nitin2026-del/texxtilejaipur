-- Phase 7: Admin Expansion

-- 1. Site Settings
CREATE TABLE public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Verified Chats (Testimonials)
CREATE TABLE public.verified_chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    photo_url TEXT NOT NULL,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Behind the Scenes
CREATE TABLE public.behind_the_scenes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verified_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.behind_the_scenes ENABLE ROW LEVEL SECURITY;

-- Policies for Tables
-- Public Read
CREATE POLICY "Public can view settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public can view active verified chats" ON public.verified_chats FOR SELECT USING (status = 'published');
CREATE POLICY "Public can view active behind the scenes" ON public.behind_the_scenes FOR SELECT USING (status = 'published');

-- Admin Write
CREATE POLICY "Admins manage settings" ON public.site_settings FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage verified chats" ON public.verified_chats FOR ALL USING (public.is_admin());
CREATE POLICY "Admins manage behind the scenes" ON public.behind_the_scenes FOR ALL USING (public.is_admin());

-- Storage Buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
('verified-chats', 'verified-chats', true),
('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Verified Chats
CREATE POLICY "Public Read Verified Chats" ON storage.objects FOR SELECT USING (bucket_id = 'verified-chats');
CREATE POLICY "Admin Write Verified Chats" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'verified-chats' AND public.is_admin()
);

-- Storage RLS: Videos
CREATE POLICY "Public Read Videos" ON storage.objects FOR SELECT USING (bucket_id = 'videos');
CREATE POLICY "Admin Write Videos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND public.is_admin()
);
