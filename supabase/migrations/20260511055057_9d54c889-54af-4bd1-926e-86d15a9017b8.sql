
-- 1. Add gif_url column to exercises
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS gif_url text;

-- 2. Replace handle_new_user trigger to always generate member_id when missing
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
  final_member_id := base_member_id;

  while exists (select 1 from public.profiles where upper(member_id) = upper(final_member_id)) loop
    attempt := attempt + 1;
    final_member_id := base_member_id || lpad(attempt::text, 2, '0');
  end loop;

  insert into public.profiles (
    user_id, name, phone, age, height, weight, gender, fitness_level, member_id
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New Member'),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'age', '')::integer,
    nullif(new.raw_user_meta_data->>'height', ''),
    nullif(new.raw_user_meta_data->>'weight', '')::numeric,
    nullif(new.raw_user_meta_data->>'gender', ''),
    coalesce(new.raw_user_meta_data->>'fitness_level', 'beginner'),
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
    member_id = coalesce(nullif(public.profiles.member_id, ''), excluded.member_id);

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when new.raw_user_meta_data->>'user_type' = 'sub_user' then 'sub_user'::app_role else 'member'::app_role end
  )
  on conflict (user_id, role) do nothing;

  return new;
end;
$function$;

-- 3. Backfill missing member_ids for existing profiles
DO $$
DECLARE
  r RECORD;
  base_id text;
  final_id text;
  attempt int;
  first_word text;
  digits text;
BEGIN
  FOR r IN SELECT p.id, p.user_id, p.name, p.phone FROM public.profiles p WHERE p.member_id IS NULL OR p.member_id = '' LOOP
    first_word := split_part(coalesce(r.name, 'USER'), ' ', 1);
    base_id := upper(substr(regexp_replace(first_word || 'XXXX', '[^a-zA-Z]', '', 'g'), 1, 4))
               || right('0000' || regexp_replace(coalesce(r.phone, ''), '\D', '', 'g'), 4);
    final_id := base_id;
    attempt := 0;
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE upper(member_id) = upper(final_id) AND user_id <> r.user_id) LOOP
      attempt := attempt + 1;
      final_id := base_id || lpad(attempt::text, 2, '0');
    END LOOP;
    UPDATE public.profiles SET member_id = final_id WHERE id = r.id;
  END LOOP;
END $$;
