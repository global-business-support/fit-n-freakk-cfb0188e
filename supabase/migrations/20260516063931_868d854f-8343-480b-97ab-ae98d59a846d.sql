CREATE POLICY "Members can create own workout schedules"
ON public.workout_schedules
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can update own workout schedules"
ON public.workout_schedules
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can delete own workout schedules"
ON public.workout_schedules
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE UNIQUE INDEX IF NOT EXISTS workout_completions_user_exercise_date_key
ON public.workout_completions (user_id, exercise_id, completed_on);