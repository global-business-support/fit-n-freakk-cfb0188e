create or replace function public.complete_user_registration(_user_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb;
  final_member_id text;
  final_role public.app_role;
begin
  select raw_user_meta_data
    into meta
  from auth.users
  where id = _user_id;

  if meta is null then
    raise exception 'Registration user not found';
  end if;

  final_member_id := nullif(meta->>'member_id', '');
  if final_member_id is null then
    final_member_id := upper(substr(regexp_replace(coalesce(meta->>'first_name', meta->>'name', 'USER'), '[^a-zA-Z]', '', 'g') || 'XXXX', 1, 4)) ||
      right('0000' || regexp_replace(coalesce(meta->>'phone', ''), '\D', '', 'g'), 4);
  end if;

  final_role := case
    when meta->>'user_type' = 'sub_user' then 'sub_user'::public.app_role
    else 'member'::public.app_role
  end;

  insert into public.profiles (
    user_id,
    name,
    phone,
    age,
    height,
    weight,
    gender,
    fitness_level,
    member_id
  )
  values (
    _user_id,
    coalesce(nullif(meta->>'name', ''), 'New Member'),
    nullif(meta->>'phone', ''),
    nullif(meta->>'age', '')::integer,
    nullif(meta->>'height', ''),
    nullif(meta->>'weight', '')::numeric,
    nullif(meta->>'gender', ''),
    coalesce(nullif(meta->>'fitness_level', ''), 'beginner'),
    final_member_id
  )
  on conflict (user_id) do update set
    name = excluded.name,
    phone = excluded.phone,
    age = excluded.age,
    height = excluded.height,
    weight = excluded.weight,
    gender = excluded.gender,
    fitness_level = excluded.fitness_level,
    member_id = excluded.member_id,
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (_user_id, final_role)
  on conflict (user_id, role) do nothing;

  return final_member_id;
end;
$$;

revoke all on function public.complete_user_registration(uuid) from public;
grant execute on function public.complete_user_registration(uuid) to anon, authenticated;