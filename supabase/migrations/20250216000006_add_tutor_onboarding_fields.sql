-- Add tutor onboarding fields to support complete registration flow

-- Add fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS birth_place TEXT,
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female')),
ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- Add fields to tutor_profiles table
ALTER TABLE public.tutor_profiles
ADD COLUMN IF NOT EXISTS id_card_url TEXT,
ADD COLUMN IF NOT EXISTS selfie_url TEXT,
ADD COLUMN IF NOT EXISTS last_education TEXT,
ADD COLUMN IF NOT EXISTS school_name TEXT,
ADD COLUMN IF NOT EXISTS is_onboarded BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id);

-- Create availability table if not exists (for day/time slots)
CREATE TABLE IF NOT EXISTS public.tutor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tutor_id, day_of_week, start_time)
);

-- Enable RLS on availability
ALTER TABLE public.tutor_availability ENABLE ROW LEVEL SECURITY;

-- RLS Policies for availability
DROP POLICY IF EXISTS "Tutors can manage own availability" ON public.tutor_availability;
CREATE POLICY "Tutors can manage own availability"
  ON public.tutor_availability
  FOR ALL
  TO authenticated
  USING (tutor_id = auth.uid())
  WITH CHECK (tutor_id = auth.uid());

-- Allow public to read tutor availability
DROP POLICY IF EXISTS "Public can read availability" ON public.tutor_availability;
CREATE POLICY "Public can read availability"
  ON public.tutor_availability
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant permissions
GRANT ALL ON public.tutor_availability TO authenticated;
GRANT SELECT ON public.tutor_availability TO anon;

-- Comments
COMMENT ON COLUMN public.tutor_profiles.is_onboarded IS 'Whether tutor has completed full registration';
COMMENT ON COLUMN public.tutor_profiles.submitted_at IS 'When tutor submitted profile for approval';
COMMENT ON COLUMN public.tutor_profiles.approved_at IS 'When admin approved the tutor';
