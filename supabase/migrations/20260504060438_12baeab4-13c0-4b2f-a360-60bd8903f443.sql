
-- Posts table
CREATE TYPE public.post_type AS ENUM ('photo', 'reel', 'progress');
CREATE TYPE public.post_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.member_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.post_type NOT NULL,
  media_url text,
  caption text,
  progress_data jsonb,
  status public.post_status NOT NULL DEFAULT 'pending',
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.member_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own posts" ON public.member_posts
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Everyone views approved posts" ON public.member_posts
FOR SELECT TO authenticated USING (status = 'approved');

CREATE POLICY "Admins view all posts" ON public.member_posts
FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Members create own posts" ON public.member_posts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members delete own posts" ON public.member_posts
FOR DELETE TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage posts" ON public.member_posts
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_member_posts_updated_at
BEFORE UPDATE ON public.member_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public posts bucket (media is publicly viewable once approved; upload restricted)
INSERT INTO storage.buckets (id, name, public) VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view posts media" ON storage.objects
FOR SELECT USING (bucket_id = 'posts');

CREATE POLICY "Users upload own posts media" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'posts' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own posts media" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'posts' AND ((auth.uid())::text = (storage.foldername(name))[1] OR has_role(auth.uid(), 'admin'::app_role)));

-- Exercise difficulty
ALTER TABLE public.exercises ADD COLUMN IF NOT EXISTS difficulty text DEFAULT 'beginner';
