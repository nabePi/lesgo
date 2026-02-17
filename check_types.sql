-- Check column types
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tutor_availability';

-- Check actual data for Ibnu Adi
SELECT *
FROM public.tutor_availability ta
JOIN public.profiles p ON ta.tutor_id = p.id
WHERE p.name = 'Ibnu Adi';