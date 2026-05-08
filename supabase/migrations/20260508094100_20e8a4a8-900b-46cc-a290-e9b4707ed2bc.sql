create table if not exists public.workout_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  exercise_id uuid not null,
  scheduled_day integer not null,
  completed_on date not null default current_date,
  completed_at timestamp with time zone not null default now(),
  notes text,
  unique (user_id, exercise_id, completed_on)
);

alter table public.workout_completions enable row level security;

create policy "Members view own workout completions"
on public.workout_completions
for select
to authenticated
using (auth.uid() = user_id);

create policy "Members add own workout completions"
on public.workout_completions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Members update own workout completions"
on public.workout_completions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Members delete own workout completions"
on public.workout_completions
for delete
to authenticated
using (auth.uid() = user_id);

create policy "Admins manage workout completions"
on public.workout_completions
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'::app_role))
with check (public.has_role(auth.uid(), 'admin'::app_role));

create index if not exists idx_workout_completions_user_date
on public.workout_completions (user_id, completed_on desc);

create index if not exists idx_workout_completions_exercise
on public.workout_completions (exercise_id);

create policy "Users can create own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create unique index if not exists profiles_user_id_unique
on public.profiles (user_id);

create unique index if not exists profiles_member_id_unique
on public.profiles (upper(member_id))
where member_id is not null and trim(member_id) <> '';

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();