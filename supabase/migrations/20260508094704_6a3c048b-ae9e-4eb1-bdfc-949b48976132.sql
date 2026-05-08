create policy "Users can add own basic role"
on public.user_roles
for insert
to authenticated
with check (
  auth.uid() = user_id
  and role in ('member'::app_role, 'sub_user'::app_role)
);

create unique index if not exists user_roles_user_id_role_unique
on public.user_roles (user_id, role);