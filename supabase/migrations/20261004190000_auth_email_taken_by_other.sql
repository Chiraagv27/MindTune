CREATE OR REPLACE FUNCTION public.auth_email_taken_by_other(lookup_email text, current_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE lower(trim(email)) = lower(trim(lookup_email))
      AND id IS DISTINCT FROM current_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.auth_email_taken_by_other(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.auth_email_taken_by_other(text, uuid) TO service_role;
