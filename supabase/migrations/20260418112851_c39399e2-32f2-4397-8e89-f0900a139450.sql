ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS fitness_level text DEFAULT 'beginner';