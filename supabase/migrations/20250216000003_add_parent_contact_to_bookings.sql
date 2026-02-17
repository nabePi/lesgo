-- Add parent contact columns to bookings table for non-authenticated bookings
-- WhatsApp number will be used for future login and transaction history

-- Add parent_name column
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS parent_name TEXT;

-- Add parent_whatsapp column
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS parent_whatsapp TEXT;

-- Make parent_id nullable since users can book without logging in
ALTER TABLE public.bookings ALTER COLUMN parent_id DROP NOT NULL;

-- Add index on parent_whatsapp for faster lookup when users login in the future
CREATE INDEX IF NOT EXISTS idx_bookings_parent_whatsapp ON public.bookings(parent_whatsapp);

-- Update RLS policies to allow anonymous bookings
-- Drop existing insert policy if it requires authentication
DROP POLICY IF EXISTS "Parents can create bookings" ON public.bookings;

-- Create new policy that allows anonymous inserts
CREATE POLICY "Anyone can create bookings"
  ON public.bookings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Keep existing select/update policies for authenticated users
DROP POLICY IF EXISTS "Parents can view own bookings" ON public.bookings;
CREATE POLICY "Parents can view own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    parent_id = auth.uid() OR
    parent_whatsapp = (SELECT whatsapp FROM public.profiles WHERE id = auth.uid())
  );

-- Add comment explaining the WhatsApp field usage
COMMENT ON COLUMN public.bookings.parent_whatsapp IS 'WhatsApp number for parent communication and future login identification';
COMMENT ON COLUMN public.bookings.parent_name IS 'Parent/guardian name for the booking';
