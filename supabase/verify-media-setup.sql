-- Verification Script for Media Features Setup
-- Run this to check if everything is configured correctly

-- ============================================================================
-- 1. CHECK DAILY_REFLECTIONS TABLE HAS MEDIA_URLS COLUMN
-- ============================================================================
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'daily_reflections'
    AND column_name = 'media_urls';

-- Expected result: Should show media_urls column with data_type = 'ARRAY'

-- ============================================================================
-- 2. CHECK INDEX EXISTS FOR DAILY_REFLECTIONS
-- ============================================================================
SELECT 
    indexname, 
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename = 'daily_reflections'
    AND indexname = 'idx_daily_reflections_user_date';

-- Expected result: Should show the index exists

-- ============================================================================
-- 3. CHECK VAULT BUCKET CONFIGURATION
-- ============================================================================
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'vault';

-- Expected result: 
-- - file_size_limit should be 52428800 (50MB)
-- - allowed_mime_types should include image/* and video/* types

-- ============================================================================
-- 4. CHECK MEDIA BUCKET EXISTS
-- ============================================================================
SELECT 
    id,
    name,
    public,
    file_size_limit
FROM storage.buckets 
WHERE id = 'media';

-- Expected result: Should show media bucket exists, public = false

-- ============================================================================
-- 5. CHECK MEDIA BUCKET POLICIES EXIST
-- ============================================================================
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
    AND tablename = 'objects'
    AND policyname LIKE '%media%';

-- Expected result: Should show 3 policies:
-- 1. "Users can upload to media" (cmd = INSERT)
-- 2. "Users can read own media files" (cmd = SELECT)
-- 3. "Users can delete own media files" (cmd = DELETE)

-- ============================================================================
-- 6. SUMMARY CHECK (All in one query)
-- ============================================================================
SELECT 
    'Daily Reflections Media Column' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = 'daily_reflections'
                AND column_name = 'media_urls'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as status
UNION ALL
SELECT 
    'Daily Reflections Index',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
                AND tablename = 'daily_reflections'
                AND indexname = 'idx_daily_reflections_user_date'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END
UNION ALL
SELECT 
    'Vault Bucket (50MB limit)',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE id = 'vault' 
                AND file_size_limit = 52428800
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END
UNION ALL
SELECT 
    'Vault Bucket (Image/Video MIME types)',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE id = 'vault' 
                AND allowed_mime_types && ARRAY['image/jpeg', 'video/mp4']
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END
UNION ALL
SELECT 
    'Media Bucket Exists',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE id = 'media'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END
UNION ALL
SELECT 
    'Media Upload Policy',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' 
                AND tablename = 'objects'
                AND policyname = 'Users can upload to media'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END
UNION ALL
SELECT 
    'Media Read Policy',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' 
                AND tablename = 'objects'
                AND policyname = 'Users can read own media files'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END
UNION ALL
SELECT 
    'Media Delete Policy',
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'storage' 
                AND tablename = 'objects'
                AND policyname = 'Users can delete own media files'
        ) THEN '✅ PASS'
        ELSE '❌ FAIL'
    END;

-- Expected result: All 8 checks should show "✅ PASS"

