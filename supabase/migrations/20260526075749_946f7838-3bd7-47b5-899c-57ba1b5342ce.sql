
-- Normalize body parts (trim, fix variants)
UPDATE public.exercises SET body_part = TRIM(body_part);
UPDATE public.exercises SET body_part = 'Abs' WHERE LOWER(body_part) IN ('abs','ab','core','sit');
UPDATE public.exercises SET body_part = 'Shoulders' WHERE LOWER(body_part) IN ('shoulder','shoulders');
UPDATE public.exercises SET body_part = 'Back' WHERE LOWER(body_part) = 'back';
UPDATE public.exercises SET body_part = 'Chest' WHERE LOWER(body_part) = 'chest';
UPDATE public.exercises SET body_part = 'Legs' WHERE LOWER(body_part) = 'legs';
UPDATE public.exercises SET body_part = 'Arms' WHERE LOWER(body_part) = 'arms';
UPDATE public.exercises SET body_part = 'Biceps' WHERE LOWER(body_part) = 'biceps';
UPDATE public.exercises SET body_part = 'Triceps' WHERE LOWER(body_part) = 'triceps';
UPDATE public.exercises SET body_part = 'Glutes' WHERE LOWER(body_part) = 'glutes';
UPDATE public.exercises SET body_part = 'Calves' WHERE LOWER(body_part) = 'calves';
UPDATE public.exercises SET body_part = 'Traps' WHERE LOWER(body_part) = 'traps';
UPDATE public.exercises SET body_part = 'Cardio' WHERE LOWER(body_part) = 'cardio';

-- Remove program-style entries that aren't real exercises
DELETE FROM public.exercises WHERE body_part = 'Muscle Building';

-- Add FK so PostgREST can embed exercises into workout_completions
ALTER TABLE public.workout_completions
  ADD CONSTRAINT workout_completions_exercise_id_fkey
  FOREIGN KEY (exercise_id) REFERENCES public.exercises(id) ON DELETE CASCADE;
