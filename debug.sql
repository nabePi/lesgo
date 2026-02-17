-- Get Ibnu Adi's user_id
SELECT id, name, email
FROM public.profiles
WHERE name = 'Ibnu Adi';

-- Then check availability with that exact user_id
SELECT *
FROM public.tutor_availability
WHERE tutor_id = 'PASTE_USER_ID_HERE';
