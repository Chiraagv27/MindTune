create or replace function public.sync_account_login(p_user_id uuid, p_username text)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_email text;
  v_username text;
begin
  select email into v_email from auth.users where id = p_user_id;
  if v_email is null or length(trim(v_email)) = 0 then
    raise exception 'Account not found';
  end if;

  v_username := trim(p_username);
  if char_length(v_username) < 3 then
    raise exception 'Username must be at least 3 characters';
  end if;

  if exists (
    select 1 from public.personal_info
    where username ilike v_username and id <> p_user_id
  ) then
    raise exception 'That username is already taken';
  end if;

  update public.personal_info
    set email = v_email, username = v_username
    where id = p_user_id;

  update public.pp_user_profiles
    set email = v_email, display_name = v_username, updated_at = now()
    where id = p_user_id;

  update public.pp_users
    set email = v_email, name = v_username
    where id = p_user_id;

  update auth.users
    set raw_user_meta_data = jsonb_set(coalesce(raw_user_meta_data, '{}'::jsonb), '{username}', to_jsonb(v_username), true),
        updated_at = now()
    where id = p_user_id;

  update auth.identities
    set identity_data = jsonb_set(coalesce(identity_data, '{}'::jsonb), '{email}', to_jsonb(v_email), true),
        updated_at = now()
    where user_id = p_user_id;
end;
$$;

revoke all on function public.sync_account_login(uuid, text) from public, anon, authenticated;
grant execute on function public.sync_account_login(uuid, text) to service_role;
