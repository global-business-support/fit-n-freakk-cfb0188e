CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  base_member_id text;
  final_member_id text;
  attempt integer := 0;
begin
  base_member_id := nullif(new.raw_user_meta_data->>'member_id', '');

  if base_member_id is null then
    base_member_id :=
      upper(substr(regexp_replace(coalesce(new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'name', 'USER'), '[^a-zA-Z]', '', 'g') || 'XXXX', 1, 4))
      || right('0000' || regexp_replace(coalesce(new.raw_user_meta_data->>'phone', ''), '\D', '', 'g'), 4);
  end if;

  base_member_id := upper(regexp_replace(base_member_id, '[^A-Z0-9]', '', 'g'));
  if base_member_id = '' then
    base_member_id := 'USER0000';
  end if;

  final_member_id := base_member_id;

  while exists (
    select 1 from public.profiles
    where upper(member_id) = upper(final_member_id)
      and user_id <> new.id
  ) loop
    attempt := attempt + 1;
    final_member_id := base_member_id || lpad(attempt::text, 2, '0');
  end loop;

  insert into public.profiles (
    user_id, name, phone, age, height, weight, gender, fitness_level, member_id
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), 'New Member'),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'age', '')::integer,
    nullif(new.raw_user_meta_data->>'height', ''),
    nullif(new.raw_user_meta_data->>'weight', '')::numeric,
    nullif(new.raw_user_meta_data->>'gender', ''),
    coalesce(nullif(new.raw_user_meta_data->>'fitness_level', ''), 'beginner'),
    final_member_id
  )
  on conflict (user_id) do update set
    name = excluded.name,
    phone = coalesce(excluded.phone, public.profiles.phone),
    age = coalesce(excluded.age, public.profiles.age),
    height = coalesce(excluded.height, public.profiles.height),
    weight = coalesce(excluded.weight, public.profiles.weight),
    gender = coalesce(excluded.gender, public.profiles.gender),
    fitness_level = coalesce(excluded.fitness_level, public.profiles.fitness_level),
    member_id = coalesce(nullif(public.profiles.member_id, ''), excluded.member_id),
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when new.raw_user_meta_data->>'user_type' = 'sub_user' then 'sub_user'::public.app_role else 'member'::public.app_role end
  )
  on conflict (user_id, role) do nothing;

  return new;
end;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

DO $$
declare
  r record;
  base_member_id text;
  final_member_id text;
  attempt integer;
begin
  for r in
    select p.user_id, p.name, p.phone
    from public.profiles p
    where p.member_id is null or btrim(p.member_id) = ''
  loop
    base_member_id := upper(substr(regexp_replace(coalesce(split_part(r.name, ' ', 1), r.name, 'USER'), '[^a-zA-Z]', '', 'g') || 'XXXX', 1, 4))
      || right('0000' || regexp_replace(coalesce(r.phone, ''), '\D', '', 'g'), 4);
    base_member_id := upper(regexp_replace(base_member_id, '[^A-Z0-9]', '', 'g'));
    if base_member_id = '' then base_member_id := 'USER0000'; end if;

    final_member_id := base_member_id;
    attempt := 0;
    while exists (select 1 from public.profiles where upper(member_id) = upper(final_member_id) and user_id <> r.user_id) loop
      attempt := attempt + 1;
      final_member_id := base_member_id || lpad(attempt::text, 2, '0');
    end loop;

    update public.profiles
    set member_id = final_member_id,
        updated_at = now()
    where user_id = r.user_id;
  end loop;
end $$;