-- 1) Add female-specific exercises with proven YouTube videos
INSERT INTO public.exercises (name, body_part, gender_target, video_url, sets, reps, description) VALUES
  ('Hip Thrust', 'Glutes', 'female', 'https://www.youtube.com/watch?v=xDmFkJxPzeM', 3, '12-15', 'Build & lift the glutes — go heavy with hips up.'),
  ('Glute Bridge', 'Glutes', 'female', 'https://www.youtube.com/watch?v=8bbE64NuDTU', 3, '15-20', 'Squeeze glutes at the top, hold 2 seconds.'),
  ('Cable Kickback', 'Glutes', 'female', 'https://www.youtube.com/watch?v=SqO-fL1Z9_o', 3, '12-15', 'Isolated glute toner — keep the back flat.'),
  ('Bulgarian Split Squat', 'Glutes', 'female', 'https://www.youtube.com/watch?v=2C-uNgKwPLE', 3, '10-12', 'Sculpts glutes & thighs deeply.'),
  ('Sumo Squat', 'Glutes', 'female', 'https://www.youtube.com/watch?v=1oed-UmAxFs', 3, '15', 'Wide stance — fires inner thighs and glutes.'),
  ('Donkey Kick', 'Glutes', 'female', 'https://www.youtube.com/watch?v=MctU3SsxMoM', 3, '15 each', 'Activates the glute medius.'),
  ('Fire Hydrant', 'Glutes', 'female', 'https://www.youtube.com/watch?v=I4rIw3Ot36s', 3, '15 each', 'Side-glute toner.'),
  ('Booty Band Walk', 'Glutes', 'female', 'https://www.youtube.com/watch?v=2zIJP3ePVe0', 3, '20 steps', 'Loop band above knees, mini steps.'),
  ('Inner Thigh Lift', 'Legs', 'female', 'https://www.youtube.com/watch?v=DmpckYlJW40', 3, '15 each', 'Tone the inner thighs.'),
  ('Standing Crunch', 'Abs', 'female', 'https://www.youtube.com/watch?v=eGo4IYlbE5g', 3, '20', 'No-equipment ab toner.');

-- 2) Tag heavy mass exercises as male-leaning so females don't see them on schedules
UPDATE public.exercises SET gender_target = 'male' WHERE name IN (
  'Barbell Bench Press', 'Deadlift', 'Bent Over Barbell Row', 'Barbell Back Squat'
);

-- 3) Wipe and rebuild gender-aware default weekly schedule for ALL existing members
DELETE FROM public.workout_schedules WHERE user_id IN (SELECT user_id FROM public.user_roles);

-- MALE plan: chest/back/shoulder/arm focus
INSERT INTO public.workout_schedules (user_id, exercise_id, day_of_week, order_index)
SELECT u.user_id, e.id, plan.day_of_week, plan.order_index
FROM (SELECT DISTINCT p.user_id FROM public.profiles p
      JOIN public.user_roles r ON r.user_id = p.user_id
      WHERE COALESCE(p.gender,'male') = 'male' AND r.role IN ('member','admin','manager','sub_user')) u
CROSS JOIN LATERAL (VALUES
  -- Mon: Chest
  ('Push Ups', 1, 0), ('Incline Dumbbell Press', 1, 1), ('Barbell Bench Press', 1, 2),
  -- Tue: Back
  ('Lat Pulldown', 2, 0), ('Bent Over Barbell Row', 2, 1), ('Deadlift', 2, 2),
  -- Wed: Legs
  ('Barbell Back Squat', 3, 0), ('Leg Press', 3, 1), ('Walking Lunges', 3, 2),
  -- Thu: Shoulders
  ('Overhead Shoulder Press', 4, 0), ('Lateral Raises', 4, 1), ('Face Pulls', 4, 2),
  -- Fri: Arms
  ('Barbell Bicep Curl', 5, 0), ('Hammer Curls', 5, 1), ('Tricep Rope Pushdown', 5, 2),
  -- Sat: Cardio + Core
  ('Burpees', 6, 0), ('Mountain Climbers', 6, 1), ('Plank', 6, 2),
  -- Sun: Abs
  ('Russian Twists', 7, 0), ('Hanging Leg Raises', 7, 1)
) AS plan(name, day_of_week, order_index)
JOIN public.exercises e ON e.name = plan.name;

-- FEMALE plan: glutes/legs/core/toning
INSERT INTO public.workout_schedules (user_id, exercise_id, day_of_week, order_index)
SELECT u.user_id, e.id, plan.day_of_week, plan.order_index
FROM (SELECT DISTINCT p.user_id FROM public.profiles p
      JOIN public.user_roles r ON r.user_id = p.user_id
      WHERE p.gender = 'female' AND r.role IN ('member','admin','manager','sub_user')) u
CROSS JOIN LATERAL (VALUES
  -- Mon: Glutes
  ('Hip Thrust', 1, 0), ('Glute Bridge', 1, 1), ('Cable Kickback', 1, 2),
  -- Tue: Legs/Booty
  ('Sumo Squat', 2, 0), ('Bulgarian Split Squat', 2, 1), ('Walking Lunges', 2, 2),
  -- Wed: Cardio
  ('Jump Rope', 3, 0), ('Mountain Climbers', 3, 1), ('Burpees', 3, 2),
  -- Thu: Glute Activation
  ('Donkey Kick', 4, 0), ('Fire Hydrant', 4, 1), ('Booty Band Walk', 4, 2),
  -- Fri: Toning
  ('Inner Thigh Lift', 5, 0), ('Lateral Raises', 5, 1), ('Hammer Curls', 5, 2),
  -- Sat: Abs
  ('Standing Crunch', 6, 0), ('Russian Twists', 6, 1), ('Plank', 6, 2),
  -- Sun: Active recovery
  ('Glute Bridge', 7, 0), ('Plank', 7, 1)
) AS plan(name, day_of_week, order_index)
JOIN public.exercises e ON e.name = plan.name;