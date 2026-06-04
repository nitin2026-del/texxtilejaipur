-- Phase 1: Seed Data

-- 1. Insert Categories
INSERT INTO public.categories (id, name, slug, description, image_url) VALUES
('c1000000-0000-0000-0000-000000000000', 'Sarees', 'sarees', 'Handwoven silk, cotton and designer sarees', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c'),
('c2000000-0000-0000-0000-000000000000', 'Kurtas', 'kurtas', 'Classic and contemporary kurta collections', 'https://images.unsplash.com/photo-1583391733958-650ac5d2bc50'),
('c3000000-0000-0000-0000-000000000000', 'Lehengas', 'lehengas', 'Bridal and festive lehengas', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8'),
('c4000000-0000-0000-0000-000000000000', 'Sherwanis', 'sherwanis', 'Men''s festive and bridal sherwanis', 'https://images.unsplash.com/photo-1594912952549-fb93be3d5fc4')
ON CONFLICT DO NOTHING;

-- 2. Insert Collections
INSERT INTO public.collections (id, name, slug, description, banner_url) VALUES
('a1000000-0000-0000-0000-000000000000', 'Festive 2024 Collection', 'festive-2024', 'Celebrate every moment in extraordinary style', 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda'),
('a2000000-0000-0000-0000-000000000000', 'The Wedding Edit', 'wedding', 'Crafted for your most cherished moments', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8')
ON CONFLICT DO NOTHING;

-- 3. Insert Products
INSERT INTO public.products (id, name, slug, description, price, stock, status, category_id, collection_id) VALUES
('b1000000-0000-0000-0000-000000000000', 'Royal Banarasi Silk Saree', 'royal-banarasi-silk-saree', 'A timeless classic woven with gold zari.', 299.99, 10, 'active', 'c1000000-0000-0000-0000-000000000000', 'a2000000-0000-0000-0000-000000000000'),
('b2000000-0000-0000-0000-000000000000', 'Classic Men''s Sherwani', 'classic-mens-sherwani', 'Elegant ivory sherwani for the modern groom.', 450.00, 5, 'active', 'c4000000-0000-0000-0000-000000000000', 'a2000000-0000-0000-0000-000000000000'),
('b3000000-0000-0000-0000-000000000000', 'Designer Velvet Lehenga', 'designer-velvet-lehenga', 'Rich velvet lehenga with intricate zardozi embroidery.', 650.00, 3, 'active', 'c3000000-0000-0000-0000-000000000000', 'a2000000-0000-0000-0000-000000000000'),
('b4000000-0000-0000-0000-000000000000', 'Jaipur Heritage Cotton Kurta', 'jaipur-heritage-cotton-kurta', 'Comfortable daily wear block-printed kurta.', 45.00, 20, 'active', 'c2000000-0000-0000-0000-000000000000', 'a1000000-0000-0000-0000-000000000000')
ON CONFLICT DO NOTHING;

-- 4. Insert Product Images
INSERT INTO public.product_images (product_id, url, is_primary, display_order) VALUES
('b1000000-0000-0000-0000-000000000000', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 1),
('b2000000-0000-0000-0000-000000000000', 'https://images.unsplash.com/photo-1594912952549-fb93be3d5fc4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 1),
('b3000000-0000-0000-0000-000000000000', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 1),
('b4000000-0000-0000-0000-000000000000', 'https://images.unsplash.com/photo-1583391733958-650ac5d2bc50?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', true, 1)
ON CONFLICT DO NOTHING;

-- 5. Insert Banners
INSERT INTO public.banners (title, subtitle, image_url, link_url, is_active) VALUES
('The Silk Collection', 'Woven with heritage, worn with pride', 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=90', '/shop', true),
('Men''s Festive Wear', 'Elegance redefined for the modern man', 'https://images.unsplash.com/photo-1583391733958-650ac5d2bc50?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=90', '/shop', true),
('Bridal Lehengas', 'Make every moment unforgettable', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=90', '/shop', true)
ON CONFLICT DO NOTHING;

-- 6. Insert Coupons
INSERT INTO public.coupons (code, discount_type, discount_value, min_order_value, is_active) VALUES
('WELCOME10', 'percentage', 10.00, 50.00, true),
('FESTIVE50', 'fixed', 50.00, 200.00, true),
('FREESHIP', 'free_shipping', 0, 100.00, true)
ON CONFLICT DO NOTHING;
