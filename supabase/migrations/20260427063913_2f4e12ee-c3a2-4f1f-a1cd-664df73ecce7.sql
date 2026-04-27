-- Add gallery + Hindi translations to exercises
ALTER TABLE public.exercises
  ADD COLUMN IF NOT EXISTS image_urls jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS how_to_use text,
  ADD COLUMN IF NOT EXISTS name_hi text,
  ADD COLUMN IF NOT EXISTS description_hi text,
  ADD COLUMN IF NOT EXISTS how_to_use_hi text;

-- Add Hindi translations to machines
ALTER TABLE public.machines
  ADD COLUMN IF NOT EXISTS name_hi text,
  ADD COLUMN IF NOT EXISTS description_hi text,
  ADD COLUMN IF NOT EXISTS how_to_use_hi text;