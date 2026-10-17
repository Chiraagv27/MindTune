DROP FUNCTION IF EXISTS public.users_with_birthday_today(date);

ALTER TABLE public.personal_info
  DROP COLUMN IF EXISTS birthday_email_sent_on,
  DROP COLUMN IF EXISTS birthday;
