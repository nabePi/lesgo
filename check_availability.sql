-- Check availability data for Ibnu Adi
SELECT
  ta.id,
  ta.tutor_id,
  p.name,
  ta.day_of_week,
  ta.start_time,
  ta.end_time,
  ta.created_at
FROM public.tutor_availability ta
JOIN public.profiles p ON ta.tutor_id = p.id
WHERE p.name = 'Ibnu Adi';