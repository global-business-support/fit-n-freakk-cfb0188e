
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'member',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  age INTEGER,
  height TEXT,
  weight NUMERIC(5,1),
  gender TEXT CHECK (gender IN ('male', 'female')),
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fees/Payments table
CREATE TABLE public.fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  month TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_date TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;

-- Weight/Progress logs
CREATE TABLE public.weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  weight NUMERIC(5,1) NOT NULL,
  calories_burned NUMERIC(8,1),
  calories_consumed NUMERIC(8,1),
  notes TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;

-- Exercises table
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  body_part TEXT NOT NULL,
  gender_target TEXT CHECK (gender_target IN ('male', 'female', 'both')) DEFAULT 'both',
  video_url TEXT,
  thumbnail_url TEXT,
  description TEXT,
  sets INTEGER,
  reps TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_out_at TIMESTAMPTZ
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile + assign member role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'New Member'));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- user_roles: users can read their own roles, admins can read all
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- profiles: users see own, admins see all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- fees: members see own, admins see all & approve
CREATE POLICY "Members view own fees" ON public.fees
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all fees" ON public.fees
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Members can submit fees" ON public.fees
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage fees" ON public.fees
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- weight_logs: members see own, admins see all
CREATE POLICY "Members view own logs" ON public.weight_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all logs" ON public.weight_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Members can insert own logs" ON public.weight_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can update own logs" ON public.weight_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- exercises: everyone can view, admins can manage
CREATE POLICY "Everyone can view exercises" ON public.exercises
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage exercises" ON public.exercises
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- attendance: members see own, admins see all
CREATE POLICY "Members view own attendance" ON public.attendance
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all attendance" ON public.attendance
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Members can check in" ON public.attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage attendance" ON public.attendance
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for profile photos and exercise videos
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

CREATE POLICY "Anyone can view media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can delete media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND (SELECT public.has_role(auth.uid(), 'admin')));
