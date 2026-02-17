-- Fix RLS policies for anonymous bookings

-- First, disable RLS on bookings temporarily to allow anonymous inserts
-- Option 1: Disable RLS completely (not recommended for production)
-- ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

-- Option 2: Keep RLS but allow anonymous inserts via policy
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Parents can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Parents can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Tutors can view assigned bookings" ON public.bookings;

-- Allow anyone to insert bookings (anonymous booking support)
CREATE POLICY "Enable insert for anonymous users"
  ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read bookings (needed for viewing booking after creation)
CREATE POLICY "Enable read for all users"
  ON public.bookings
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only allow update/delete for authenticated users who own the booking
CREATE POLICY "Enable update for authenticated users"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    parent_id = auth.uid() OR
    tutor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Verify RLS is enabled
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT INSERT, SELECT ON public.bookings TO anon;
GRANT INSERT, SELECT, UPDATE ON public.bookings TO authenticated;

-- Also fix payments table RLS for anonymous flow
DROP POLICY IF EXISTS "Anyone can create payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

CREATE POLICY "Enable insert for payments"
  ON public.payments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Enable read for payments"
  ON public.payments
  FOR SELECT
  TO anon, authenticated
  USING (true);

GRANT INSERT, SELECT ON public.payments TO anon;
GRANT INSERT, SELECT ON public.payments TO authenticated;
