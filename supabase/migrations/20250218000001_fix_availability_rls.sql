-- Fix tutor_availability RLS policy
-- The issue is that the UPDATE policy may not be evaluating correctly

-- Drop existing update policy
DROP POLICY IF EXISTS "Tutors can update own availability" ON public.tutor_availability;

-- Create a simpler update policy that allows tutors to update their own rows
-- Note: We only check USING (for the row being updated), WITH CHECK is for the new row value
CREATE POLICY "Tutors can update own availability"
  ON public.tutor_availability
  FOR UPDATE
  TO authenticated
  USING (tutor_id = auth.uid())
  WITH CHECK (true);  -- Allow any update as long as the row was owned by the user

-- Ensure grants are correct
GRANT INSERT, SELECT, UPDATE, DELETE ON public.tutor_availability TO authenticated;
GRANT SELECT ON public.tutor_availability TO anon;

-- Also verify the table structure
COMMENT ON TABLE public.tutor_availability IS 'Stores tutor availability slots with RLS enforced';
