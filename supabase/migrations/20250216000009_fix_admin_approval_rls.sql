-- Fix RLS policies to allow admin to approve/reject tutors

-- Allow admin users to update any tutor profile (for approval/rejection)
DROP POLICY IF EXISTS "Admin can update any tutor profile" ON public.tutor_profiles;

CREATE POLICY "Admin can update any tutor profile"
  ON public.tutor_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow admin to view all pending tutor profiles
DROP POLICY IF EXISTS "Admin can view all tutor profiles" ON public.tutor_profiles;

CREATE POLICY "Admin can view all tutor profiles"
  ON public.tutor_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
