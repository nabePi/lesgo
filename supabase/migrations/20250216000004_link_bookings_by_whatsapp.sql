-- Function to link anonymous bookings to a user when they sign up with WhatsApp
CREATE OR REPLACE FUNCTION link_bookings_by_whatsapp()
RETURNS TRIGGER AS $$
BEGIN
  -- Update bookings where parent_whatsapp matches the new user's phone
  UPDATE public.bookings
  SET parent_id = NEW.id
  WHERE parent_whatsapp = NEW.phone
    AND parent_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-link bookings when a profile is created
DROP TRIGGER IF EXISTS link_bookings_on_profile_create ON public.profiles;
CREATE TRIGGER link_bookings_on_profile_create
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION link_bookings_by_whatsapp();

-- Also link when phone number is updated
CREATE OR REPLACE FUNCTION link_bookings_on_phone_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only proceed if phone number changed
  IF OLD.phone IS DISTINCT FROM NEW.phone THEN
    UPDATE public.bookings
    SET parent_id = NEW.id
    WHERE parent_whatsapp = NEW.phone
      AND parent_id IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS link_bookings_on_phone_update ON public.profiles;
CREATE TRIGGER link_bookings_on_phone_update
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION link_bookings_on_phone_update();

-- View for users to see their complete booking history
-- Includes both linked bookings (by parent_id) and anonymous bookings (by phone match)
CREATE OR REPLACE VIEW user_booking_history AS
SELECT
  b.*,
  p.name as tutor_name,
  p.phone as tutor_phone,
  tp.subjects as tutor_subjects,
  pay.status as payment_status,
  pay.paid_at
FROM public.bookings b
JOIN public.profiles p ON b.tutor_id = p.id
JOIN public.tutor_profiles tp ON b.tutor_id = tp.user_id
LEFT JOIN public.payments pay ON b.id = pay.booking_id
WHERE b.parent_id = auth.uid()
   OR b.parent_whatsapp = (SELECT phone FROM public.profiles WHERE id = auth.uid());

-- Enable RLS on the view
ALTER VIEW user_booking_history OWNER TO postgres;
