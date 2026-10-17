-- Google sign-in creates a new auth user. If that address was already stored
-- on a different account's pp_users row, the unique email constraint aborted
-- signup with "Database error saving new user".
CREATE OR REPLACE FUNCTION public.pp_handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.pp_users ou
  WHERE ou.email IS NOT DISTINCT FROM NEW.email
    AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.id = ou.id);

  UPDATE public.pp_users ou
  SET email = au.email
  FROM auth.users au
  WHERE ou.id = au.id
    AND ou.id IS DISTINCT FROM NEW.id
    AND lower(ou.email) = lower(NEW.email)
    AND lower(au.email) IS DISTINCT FROM lower(NEW.email);

  INSERT INTO public.pp_users (id, email, password_hash, provider, model, api_key)
  VALUES (
    NEW.id,
    NEW.email,
    'supabase_auth',
    'gemini',
    'gemini-2.0-flash',
    ''
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;

  INSERT INTO public.pp_user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''),
      NULLIF(trim(NEW.raw_user_meta_data->>'name'), ''),
      split_part(COALESCE(NEW.email, ''), '@', 1),
      'User'
    )
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$function$;
