-- Fix storage bucket RLS policies for file uploads

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner access" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tutor-documents');

-- Allow authenticated users to read files
CREATE POLICY "Allow authenticated read"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'tutor-documents');

-- Allow public to read files (for admin to view documents)
CREATE POLICY "Allow public read"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'tutor-documents');

-- Allow users to delete their own files
CREATE POLICY "Allow owner delete"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'tutor-documents' AND owner = auth.uid());

-- Make bucket public for reading
UPDATE storage.buckets
SET public = true
WHERE id = 'tutor-documents';
