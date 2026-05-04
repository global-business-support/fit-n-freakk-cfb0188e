
-- Fix media bucket: restrict INSERT to user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Users can upload own media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'media'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Restrict media SELECT to own folder + admins (was: any authenticated)
DROP POLICY IF EXISTS "Anyone can view media by path" ON storage.objects;
CREATE POLICY "Users can view own media or admins"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'media'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR has_role(auth.uid(), 'admin'::app_role)
  )
);

-- Lock down user_roles INSERT/UPDATE/DELETE to admins only (close ALL policy WITH CHECK gap)
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can insert roles" ON public.user_roles
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update roles" ON public.user_roles
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow members to update their own attendance (e.g. check-out)
CREATE POLICY "Members can update own attendance" ON public.attendance
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Tighten admin attendance manage with WITH CHECK
DROP POLICY IF EXISTS "Admins can manage attendance" ON public.attendance;
CREATE POLICY "Admins can manage attendance" ON public.attendance
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Revoke public/anon EXECUTE on SECURITY DEFINER helper that exposes auth emails
REVOKE EXECUTE ON FUNCTION public.get_email_by_member_id(text) FROM PUBLIC, anon, authenticated;
-- Allow only service_role (used internally / via edge function)
GRANT EXECUTE ON FUNCTION public.get_email_by_member_id(text) TO service_role;
