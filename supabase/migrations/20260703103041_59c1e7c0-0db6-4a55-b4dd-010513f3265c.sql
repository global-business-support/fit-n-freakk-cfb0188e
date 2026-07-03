
-- Machine-only exercises: shown only under the machine in the Machines page.
-- These are NOT part of the general exercise library and do NOT appear in workouts.
CREATE TABLE public.machine_only_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  name text NOT NULL,
  video_url text,
  thumbnail_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_machine_only_exercises_machine ON public.machine_only_exercises(machine_id, name);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.machine_only_exercises TO authenticated;
GRANT ALL ON public.machine_only_exercises TO service_role;

ALTER TABLE public.machine_only_exercises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view machine-only exercises"
  ON public.machine_only_exercises FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert machine-only exercises"
  ON public.machine_only_exercises FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can update machine-only exercises"
  ON public.machine_only_exercises FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE POLICY "Admins can delete machine-only exercises"
  ON public.machine_only_exercises FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

CREATE TRIGGER trg_machine_only_exercises_updated_at
  BEFORE UPDATE ON public.machine_only_exercises
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
