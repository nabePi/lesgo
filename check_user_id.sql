-- Check if user_id matches between tables
SELECT
  p.id as profile_id,
  p.name,
  tp.user_id as tutor_profile_user_id,
  ta.tutor_id as availability_tutor_id
FROM public.profiles p
LEFT JOIN public.tutor_profiles tp ON p.id = tp.user_id
LEFT JOIN public.tutor_availability ta ON p.id = ta.tutor_id
WHERE p.name = 'Ibnu Adi';

-- Check what tutor_id is actually in availability
SELECT DISTINCT tutor_id
FROM public.tutor_availability;
