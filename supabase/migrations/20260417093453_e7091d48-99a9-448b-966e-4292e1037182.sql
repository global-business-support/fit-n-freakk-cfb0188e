ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS member_id text UNIQUE;
CREATE INDEX IF NOT EXISTS idx_profiles_member_id ON public.profiles(member_id);