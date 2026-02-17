-- Check if tutor data is saved correctly
-- Run this to see what data exists for a tutor

-- Check tutor profile
SELECT
  tp.user_id,
  p.name,
  p.email,
  tp.id_card_url,
  tp.selfie_url,
  tp.is_onboarded,
  tp.submitted_at
FROM public.tutor_profiles tp
JOIN public.profiles p ON tp.user_id = p.id
WHERE tp.is_onboarded = true
ORDER BY tp.submitted_at DESC;

-- Check availability for a specific tutor (replace with actual user_id)
SELECT
  ta.tutor_id,
  p.name,
  ta.day_of_week,
  ta.start_time,
  ta.end_time
FROM public.tutor_availability ta
JOIN public.profiles p ON ta.tutor_id = p.id
ORDER BY ta.created_at DESC;
