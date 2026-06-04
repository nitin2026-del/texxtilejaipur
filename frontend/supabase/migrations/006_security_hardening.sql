-- ============================================================
-- 006_security_hardening.sql
-- Comprehensive RLS policy hardening for IndiThread
-- ============================================================

-- ============================================================
-- 1. REVIEWS — Users can only write their own reviews; 
--    Approved reviews visible to public
-- ============================================================
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can write own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage reviews" ON public.reviews;

CREATE POLICY "Public can view approved reviews"
  ON public.reviews FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Users can write own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage reviews"
  ON public.reviews FOR ALL
  USING (is_admin());

-- ============================================================
-- 2. WISHLISTS — Users can only see and manage their own
-- ============================================================
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own wishlist" ON public.wishlists;
DROP POLICY IF EXISTS "Admins can view all wishlists" ON public.wishlists;

CREATE POLICY "Users can manage own wishlist"
  ON public.wishlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all wishlists"
  ON public.wishlists FOR SELECT
  USING (is_admin());

-- ============================================================
-- 3. CARTS — Users can only see and manage their own cart
-- ============================================================
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own cart" ON public.carts;
DROP POLICY IF EXISTS "Admins can view all carts" ON public.carts;

CREATE POLICY "Users can manage own cart"
  ON public.carts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all carts"
  ON public.carts FOR SELECT
  USING (is_admin());

-- ============================================================
-- 4. ORDERS — Users can only see their own orders
-- ============================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can place own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON public.orders;

CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can place own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders"
  ON public.orders FOR ALL
  USING (is_admin());

-- ============================================================
-- 5. ORDER ITEMS — Accessible through order owner
-- ============================================================
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON public.order_items;
DROP POLICY IF EXISTS "Admins can manage order items" ON public.order_items;

CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own order items"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage order items"
  ON public.order_items FOR ALL
  USING (is_admin());

-- ============================================================
-- 6. PROFILES — Only owner can update their own profile
-- ============================================================
DROP POLICY IF EXISTS "Owner can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.profiles;

CREATE POLICY "Authenticated users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Owner can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 7. INQUIRIES — Public can INSERT only (not read others' data)
-- ============================================================
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit inquiry" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can manage inquiries" ON public.inquiries;

CREATE POLICY "Public can submit inquiry"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage inquiries"
  ON public.inquiries FOR ALL
  USING (is_admin());

-- ============================================================
-- 8. NEWSLETTERS — Public can subscribe, admins manage
-- ============================================================
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can subscribe newsletter" ON public.newsletters;
DROP POLICY IF EXISTS "Admins can manage newsletters" ON public.newsletters;

CREATE POLICY "Public can subscribe newsletter"
  ON public.newsletters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can manage newsletters"
  ON public.newsletters FOR ALL
  USING (is_admin());

-- ============================================================
-- 9. Add title column to inquiries for better categorization
-- ============================================================
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS inquiry_type TEXT DEFAULT 'general';
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
