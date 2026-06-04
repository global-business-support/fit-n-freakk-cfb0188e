CREATE TABLE public.machine_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(machine_id, exercise_id)
);

GRANT SELECT ON public.machine_exercises TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.machine_exercises TO authenticated;
GRANT ALL ON public.machine_exercises TO service_role;

ALTER TABLE public.machine_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view machine_exercises"
  ON public.machine_exercises FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert machine_exercises"
  ON public.machine_exercises FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete machine_exercises"
  ON public.machine_exercises FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_machine_exercises_machine ON public.machine_exercises(machine_id);
CREATE INDEX idx_machine_exercises_exercise ON public.machine_exercises(exercise_id);