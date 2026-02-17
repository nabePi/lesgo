# Storage Bucket Setup for Tutor Documents

Run this SQL in Supabase Dashboard SQL Editor:

```sql
-- Create storage bucket for tutor documents (KTP, selfie)
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutor-documents', 'tutor-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to upload documents
DROP POLICY IF EXISTS "Allow users to upload their own documents" ON storage.objects;
CREATE POLICY "Allow users to upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tutor-documents');

-- Policy: Allow users to read documents
DROP POLICY IF EXISTS "Allow users to read documents" ON storage.objects;
CREATE POLICY "Allow users to read documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'tutor-documents');

-- Policy: Allow public to read documents (needed for admin approval)
DROP POLICY IF EXISTS "Allow public read documents" ON storage.objects;
CREATE POLICY "Allow public read documents"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'tutor-documents');
```
