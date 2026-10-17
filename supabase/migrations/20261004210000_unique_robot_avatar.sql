ALTER TABLE public.pp_user_profiles
  ADD COLUMN IF NOT EXISTS robot_hash text;

CREATE OR REPLACE FUNCTION public.assign_unique_robot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  next_hash text;
  seed text;
  attempt integer;
BEGIN
  next_hash := substring(coalesce(NEW.avatar_url, '') FROM 'robohash\.org/([a-f0-9]{32})');

  IF next_hash IS NULL THEN
    seed := lower(trim(coalesce(nullif(NEW.email, ''), NEW.id::text)));
    attempt := 0;
    LOOP
      next_hash := md5(CASE WHEN attempt = 0 THEN seed ELSE seed || ':' || attempt::text END);
      EXIT WHEN NOT EXISTS (
        SELECT 1
        FROM public.pp_user_profiles
        WHERE robot_hash = next_hash
          AND id IS DISTINCT FROM NEW.id
      );
      attempt := attempt + 1;
      IF attempt > 25 THEN
        RAISE EXCEPTION 'robot_taken';
      END IF;
    END LOOP;
    NEW.avatar_url := 'https://robohash.org/' || next_hash || '?set=set1&size=128x128';
  ELSIF EXISTS (
    SELECT 1
    FROM public.pp_user_profiles
    WHERE robot_hash = next_hash
      AND id IS DISTINCT FROM NEW.id
  ) THEN
    RAISE EXCEPTION 'robot_taken';
  END IF;

  NEW.robot_hash := next_hash;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pp_user_profiles_unique_robot ON public.pp_user_profiles;
CREATE TRIGGER pp_user_profiles_unique_robot
  BEFORE INSERT OR UPDATE ON public.pp_user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_unique_robot();

UPDATE public.pp_user_profiles
SET avatar_url = avatar_url
WHERE robot_hash IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS pp_user_profiles_robot_hash_key
  ON public.pp_user_profiles (robot_hash);

CREATE OR REPLACE FUNCTION public.robot_hash_available(p_hash text, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.pp_user_profiles
    WHERE robot_hash = lower(trim(p_hash))
      AND id IS DISTINCT FROM p_user_id
  );
$$;

REVOKE ALL ON FUNCTION public.robot_hash_available(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.robot_hash_available(text, uuid) TO service_role;
