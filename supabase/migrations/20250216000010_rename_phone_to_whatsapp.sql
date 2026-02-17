-- Rename phone references to whatsapp in RLS policies and functions

-- Update RLS policy in bookings table
DROP POLICY IF EXISTS "Parents can view own bookings" ON public.bookings;
CREATE POLICY "Parents can view own bookings"
  ON public.bookings
  FOR SELECT
  TO authenticated
  USING (
    parent_id = auth.uid() OR
    parent_whatsapp = (SELECT whatsapp FROM public.profiles WHERE id = auth.uid())
  );

-- Update function to link bookings by whatsapp
CREATE OR REPLACE FUNCTION link_bookings_by_whatsapp()
RETURNS TRIGGER AS $$
BEGIN
  -- Update bookings where parent_whatsapp matches the new user's whatsapp
  UPDATE public.bookings
  SET parent_id = NEW.id
  WHERE parent_whatsapp = NEW.whatsapp
    AND parent_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rename and update trigger function for whatsapp updates
DROP TRIGGER IF EXISTS link_bookings_on_phone_update ON public.profiles;
DROP FUNCTION IF EXISTS link_bookings_on_phone_update();

CREATE OR REPLACE FUNCTION link_bookings_on_whatsapp_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if whatsapp number changed
  IF OLD.whatsapp IS DISTINCT FROM NEW.whatsapp THEN
    UPDATE public.bookings
    SET parent_id = NEW.id
    WHERE parent_whatsapp = NEW.whatsapp
      AND parent_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger for whatsapp updates
DROP TRIGGER IF EXISTS link_bookings_on_whatsapp_update ON public.profiles;
CREATE TRIGGER link_bookings_on_whatsapp_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION link_bookings_on_whatsapp_update();

-- Update user_booking_history view
DROP VIEW IF EXISTS user_booking_history;
CREATE OR REPLACE VIEW user_booking_history AS
SELECT
  b.*,
  p.name as tutor_name,
  p.whatsapp as tutor_whatsapp,
  tp.subjects as tutor_subjects,
  pay.status as payment_status,
  pay.paid_at
FROM public.bookings b
JOIN public.profiles p ON b.tutor_id = p.id
JOIN public.tutor_profiles tp ON b.tutor_id = tp.user_id
LEFT JOIN public.payments pay ON b.id = pay.booking_id
WHERE b.parent_id = auth.uid()
   OR b.parent_whatsapp = (SELECT whatsapp FROM public.profiles WHERE id = auth.uid());

-- Enable RLS on the view
ALTER VIEW user_booking_history OWNER TO postgres;

-- Update comment
COMMENT ON COLUMN public.bookings.parent_whatsapp IS 'WhatsApp number for parent communication and future login identification';
