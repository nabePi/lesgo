-- Fix storage bucket - create if not exists and make public

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('tutor-documents', 'tutor-documents', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Verify
SELECT id, name, public FROM storage.buckets WHERE id = 'tutor-documents';
