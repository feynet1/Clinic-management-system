-- =============================================================================
-- Create 'clinic-documents' Storage Bucket in Supabase (100% Free)
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/bxvfhydahvyrtvpoczrw/sql/new
-- =============================================================================

-- 1. Create the public storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'clinic-documents',
  'clinic-documents',
  true,
  52428800, -- 50MB max per file
  NULL      -- Allow all document & image types
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Grant read/write policies for clinic app
DROP POLICY IF EXISTS "Public Read clinic-documents" ON storage.objects;
CREATE POLICY "Public Read clinic-documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'clinic-documents');

DROP POLICY IF EXISTS "Public Insert clinic-documents" ON storage.objects;
CREATE POLICY "Public Insert clinic-documents"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'clinic-documents');

DROP POLICY IF EXISTS "Public Update clinic-documents" ON storage.objects;
CREATE POLICY "Public Update clinic-documents"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'clinic-documents');

DROP POLICY IF EXISTS "Public Delete clinic-documents" ON storage.objects;
CREATE POLICY "Public Delete clinic-documents"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'clinic-documents');
