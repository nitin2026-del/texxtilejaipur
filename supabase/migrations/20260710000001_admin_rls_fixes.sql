-- Fix Admin Panel RLS Policies for Guest Orders
-- Run this in the Supabase SQL Editor

-- 1. Grant Admins full access to all order items
DROP POLICY IF EXISTS "Admins have full access to order items" ON public.order_items;
CREATE POLICY "Admins have full access to order items" ON public.order_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Grant Admins full access to all orders (just in case it's missing)
DROP POLICY IF EXISTS "Admins have full access to orders" ON public.orders;
CREATE POLICY "Admins have full access to orders" ON public.orders FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. Grant Admins full access to all shipping addresses
DROP POLICY IF EXISTS "Admins have full access to shipping addresses" ON public.shipping_addresses;
CREATE POLICY "Admins have full access to shipping addresses" ON public.shipping_addresses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Grant Admins full access to all payments
DROP POLICY IF EXISTS "Admins have full access to payments" ON public.payments;
CREATE POLICY "Admins have full access to payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
