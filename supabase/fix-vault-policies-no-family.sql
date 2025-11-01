-- Fix Vault RLS Policies - Remove Family Dependency
-- Safe migration to owner-based access control
-- Run this in Supabase SQL Editor

-- ============================================================================
-- STEP 1: MAKE FAMILY_ID NULLABLE (if not already)
-- ============================================================================

-- This allows vault_items to exist without a family_id
-- Existing rows with family_id remain unchanged
ALTER TABLE public.vault_items 
ALTER COLUMN family_id DROP NOT NULL;

-- ============================================================================
-- STEP 2: UPDATE RLS POLICIES TO OWNER-BASED ACCESS
-- ============================================================================

-- DROP old family-based policies (safe with IF EXISTS)
DROP POLICY IF EXISTS "Family members can view vault items" ON public.vault_items;
DROP POLICY IF EXISTS "Family members can create vault items" ON public.vault_items;
DROP POLICY IF EXISTS "Item owner can update" ON public.vault_items;
DROP POLICY IF EXISTS "Item owner can delete" ON public.vault_items;

-- CREATE new owner-based policies (safe with DROP IF EXISTS)
DROP POLICY IF EXISTS "Users can view own vault items" ON public.vault_items;
CREATE POLICY "Users can view own vault items" 
ON public.vault_items
FOR SELECT 
USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own vault items" ON public.vault_items;
CREATE POLICY "Users can create own vault items" 
ON public.vault_items
FOR INSERT 
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own vault items" ON public.vault_items;
CREATE POLICY "Users can update own vault items" 
ON public.vault_items
FOR UPDATE 
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own vault items" ON public.vault_items;
CREATE POLICY "Users can delete own vault items" 
ON public.vault_items
FOR DELETE 
USING (owner_id = auth.uid());

-- ============================================================================
-- STEP 3: VERIFY POLICIES ARE CORRECT
-- ============================================================================

-- Check that RLS is enabled
SELECT 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'vault_items';

-- List all policies on vault_items
SELECT 
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'vault_items'
ORDER BY cmd, policyname;

-- ============================================================================
-- STEP 4: TEST INSERT (Optional - uncomment to test)
-- ============================================================================

-- This should succeed for the authenticated user
-- INSERT INTO public.vault_items (owner_id, kind, title, description, metadata)
-- VALUES (
--   auth.uid(),
--   'letter',
--   'Test Note',
--   'This is a test note to verify policies work',
--   '{"content": "Test content"}'::jsonb
-- );

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT 
  '✅ Vault RLS Policies Updated Successfully!' as status,
  'vault_items now uses owner-based access (no family dependency)' as details,
  'Users can insert/select/update/delete their own items' as access_model;

