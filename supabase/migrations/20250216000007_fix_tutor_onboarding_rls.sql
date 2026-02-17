-- Fix RLS policies for tutor onboarding flow

-- Fix tutor_profiles table RLS policies
DROP POLICY IF EXISTS "Tutors can update own profile" ON public.tutor_profiles;
DROP POLICY IF EXISTS "Tutors can view own profile" ON public.tutor_profiles;
DROP POLICY IF EXISTS "Public can view tutor profiles" ON public.tutor_profiles;

-- Allow tutors to update their own profile during onboarding
CREATE POLICY "Tutors can update own profile"
  ON public.tutor_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow tutors to view their own profile
CREATE POLICY "Tutors can view own profile"
  ON public.tutor_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow public to view active tutor profiles (for search)
CREATE POLICY "Public can view active tutor profiles"
  ON public.tutor_profiles
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Allow authenticated users to insert their own tutor profile (during registration)
CREATE POLICY "Users can insert own tutor profile"
  ON public.tutor_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Fix tutor_availability table RLS policies
DROP POLICY IF EXISTS "Tutors can manage own availability" ON public.tutor_availability;
DROP POLICY IF EXISTS "Public can read availability" ON public.tutor_availability;

-- Allow tutors to manage their own availability
CREATE POLICY "Tutors can insert own availability"
  ON public.tutor_availability
  FOR INSERT
  TO authenticated
  WITH CHECK (tutor_id = auth.uid());

CREATE POLICY "Tutors can update own availability"
  ON public.tutor_availability
  FOR UPDATE
  TO authenticated
  USING (tutor_id = auth.uid())
  WITH CHECK (tutor_id = auth.uid());

CREATE POLICY "Tutors can delete own availability"
  ON public.tutor_availability
  FOR DELETE
  TO authenticated
  USING (tutor_id = auth.uid());

-- Allow public to read availability (for booking)
CREATE POLICY "Public can read availability"
  ON public.tutor_availability
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Fix profiles table - allow users to update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Grant necessary permissions
GRANT INSERT, SELECT, UPDATE ON public.tutor_profiles TO authenticated;
GRANT INSERT, SELECT, UPDATE, DELETE ON public.tutor_availability TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
