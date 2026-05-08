create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New Member'),
    nullif(new.raw_user_meta_data->>'phone', ''),
    nullif(new.raw_user_meta_data->>'age', '')::integer,
    nullif(new.raw_user_meta_data->>'height', ''),
    nullif(new.raw_user_meta_data->>'weight', '')::numeric,
    nullif(new.raw_user_meta_data->>'gender', ''),
    coalesce(new.raw_user_meta_data->>'fitness_level', 'beginner'),
    nullif(new.raw_user_meta_data->>'member_id', '')
  )
  on conflict (user_id) do update set
    name = excluded.name,
    phone = excluded.phone,
    age = excluded.age,
    height = excluded.height,
    weight = excluded.weight,
    gender = excluded.gender,
    fitness_level = excluded.fitness_level,
    member_id = excluded.member_id;

  insert into public.user_roles (user_id, role)
  values (
    new.id,
    case when new.raw_user_meta_data->>'user_type' = 'sub_user' then 'sub_user'::app_role else 'member'::app_role end
  )
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();