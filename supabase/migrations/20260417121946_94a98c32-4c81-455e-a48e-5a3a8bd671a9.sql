-- Allow anonymous lookup of email by member_id for login flow
CREATE OR REPLACE FUNCTION public.get_email_by_member_id(_member_id text)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email
  FROM auth.users u
  JOIN public.profiles p ON p.user_id = u.id
  WHERE upper(p.member_id) = upper(_member_id)
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_email_by_member_id(text) TO anon, authenticated;