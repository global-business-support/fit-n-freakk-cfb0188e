CREATE POLICY "Anyone can view machine-only exercises"
ON public.machine_only_exercises FOR SELECT TO anon USING (true);

GRANT SELECT ON public.machine_only_exercises TO anon;
GRANT SELECT ON public.machines TO anon;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'machines' AND policyname = 'Anyone can view machines'
  ) THEN
    CREATE POLICY "Anyone can view machines" ON public.machines FOR SELECT TO anon USING (true);
  END IF;
END $$;