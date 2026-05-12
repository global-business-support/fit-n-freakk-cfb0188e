alter table public.profiles
  add column if not exists dob date,
  add column if not exists height_feet integer,
  add column if not exists height_inches integer;

create unique index if not exists profiles_member_id_upper_idx
  on public.profiles (upper(member_id))
  where member_id is not null and btrim(member_id) <> '';

alter table public.profiles
  drop constraint if exists profiles_age_positive,
  add constraint profiles_age_positive check (age is null or age >= 1),
  drop constraint if exists profiles_weight_positive,
  add constraint profiles_weight_positive check (weight is null or weight >= 1),
  drop constraint if exists profiles_height_feet_positive,
  add constraint profiles_height_feet_positive check (height_feet is null or height_feet >= 1),
  drop constraint if exists profiles_height_inches_range,
  add constraint profiles_height_inches_range check (height_inches is null or (height_inches >= 0 and height_inches <= 11));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
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
    user_id, name, phone, age, height, height_feet, height_inches, weight, gender, fitness_level, member_id, dob
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), 'New Member'),
    nullif(new.raw_user_meta_data->>'phone', ''),
    greatest(nullif(new.raw_user_meta_data->>'age', '')::integer, 1),
    nullif(new.raw_user_meta_data->>'height', ''),
    greatest(nullif(new.raw_user_meta_data->>'height_feet', '')::integer, 1),
    least(greatest(nullif(new.raw_user_meta_data->>'height_inches', '')::integer, 0), 11),
    greatest(nullif(new.raw_user_meta_data->>'weight', '')::numeric, 1),
    nullif(new.raw_user_meta_data->>'gender', ''),
    coalesce(nullif(new.raw_user_meta_data->>'fitness_level', ''), 'beginner'),
    final_member_id,
    nullif(new.raw_user_meta_data->>'dob', '')::date
  )
  on conflict (user_id) do update set
    name = excluded.name,
    phone = coalesce(excluded.phone, public.profiles.phone),
    age = coalesce(excluded.age, public.profiles.age),
    height = coalesce(excluded.height, public.profiles.height),
    height_feet = coalesce(excluded.height_feet, public.profiles.height_feet),
    height_inches = coalesce(excluded.height_inches, public.profiles.height_inches),
    weight = coalesce(excluded.weight, public.profiles.weight),
    gender = coalesce(excluded.gender, public.profiles.gender),
    fitness_level = coalesce(excluded.fitness_level, public.profiles.fitness_level),
    member_id = coalesce(nullif(public.profiles.member_id, ''), excluded.member_id),
    dob = coalesce(excluded.dob, public.profiles.dob),
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.complete_user_registration(_user_id uuid)
returns text
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  meta jsonb;
  base_member_id text;
  final_member_id text;
  final_role public.app_role;
  attempt integer := 0;
begin
  select raw_user_meta_data
    into meta
  from auth.users
  where id = _user_id;

  if meta is null then
    raise exception 'Registration user not found';
  end if;

  base_member_id := nullif(meta->>'member_id', '');
  if base_member_id is null then
    base_member_id := upper(substr(regexp_replace(coalesce(meta->>'first_name', meta->>'name', 'USER'), '[^a-zA-Z]', '', 'g') || 'XXXX', 1, 4)) ||
      right('0000' || regexp_replace(coalesce(meta->>'phone', ''), '\D', '', 'g'), 4);
  end if;
  base_member_id := upper(regexp_replace(base_member_id, '[^A-Z0-9]', '', 'g'));
  if base_member_id = '' then base_member_id := 'USER0000'; end if;
  final_member_id := base_member_id;

  while exists (
    select 1 from public.profiles
    where upper(member_id) = upper(final_member_id)
      and user_id <> _user_id
  ) loop
    attempt := attempt + 1;
    final_member_id := base_member_id || lpad(attempt::text, 2, '0');
  end loop;

  final_role := case
    when meta->>'user_type' = 'sub_user' then 'sub_user'::public.app_role
    else 'member'::public.app_role
  end;

  insert into public.profiles (
    user_id, name, phone, age, height, height_feet, height_inches, weight, gender, fitness_level, member_id, dob
  )
  values (
    _user_id,
    coalesce(nullif(meta->>'name', ''), 'New Member'),
    nullif(meta->>'phone', ''),
    greatest(nullif(meta->>'age', '')::integer, 1),
    nullif(meta->>'height', ''),
    greatest(nullif(meta->>'height_feet', '')::integer, 1),
    least(greatest(nullif(meta->>'height_inches', '')::integer, 0), 11),
    greatest(nullif(meta->>'weight', '')::numeric, 1),
    nullif(meta->>'gender', ''),
    coalesce(nullif(meta->>'fitness_level', ''), 'beginner'),
    final_member_id,
    nullif(meta->>'dob', '')::date
  )
  on conflict (user_id) do update set
    name = excluded.name,
    phone = coalesce(excluded.phone, public.profiles.phone),
    age = coalesce(excluded.age, public.profiles.age),
    height = coalesce(excluded.height, public.profiles.height),
    height_feet = coalesce(excluded.height_feet, public.profiles.height_feet),
    height_inches = coalesce(excluded.height_inches, public.profiles.height_inches),
    weight = coalesce(excluded.weight, public.profiles.weight),
    gender = coalesce(excluded.gender, public.profiles.gender),
    fitness_level = coalesce(excluded.fitness_level, public.profiles.fitness_level),
    member_id = coalesce(nullif(public.profiles.member_id, ''), excluded.member_id),
    dob = coalesce(excluded.dob, public.profiles.dob),
    updated_at = now();

  insert into public.user_roles (user_id, role)
  values (_user_id, final_role)
  on conflict (user_id, role) do nothing;

  return (select member_id from public.profiles where user_id = _user_id);
end;
$function$;

create or replace function public.get_email_by_member_id(_member_id text)
returns text
language sql
stable
security definer
set search_path = public
as $function$
  select u.email
  from auth.users u
  join public.profiles p on p.user_id = u.id
  where upper(regexp_replace(coalesce(p.member_id, ''), '[^A-Z0-9]', '', 'g')) = upper(regexp_replace(coalesce(_member_id, ''), '[^A-Z0-9]', '', 'g'))
  limit 1;
$function$;