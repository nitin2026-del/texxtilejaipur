-- 1. Add missing jai_coins column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS jai_coins INTEGER DEFAULT 0;

-- 2. Drop the insecure RLS policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 3. Create a secure RLS policy that explicitly prevents standard users from updating the role column.
-- Users can still update their own rows, but any attempt to change their role will violate the WITH CHECK clause.
CREATE POLICY "Users can update their own profile safely" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND (
    -- Allow the update if the user is an admin OR if the role is not being changed from its current value
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  )
);
