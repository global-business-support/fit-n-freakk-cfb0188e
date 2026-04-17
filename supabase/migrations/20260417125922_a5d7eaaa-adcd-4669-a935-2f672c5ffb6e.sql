-- Add status + reason to attendance for present/absent toggle
ALTER TABLE public.attendance 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'present',
  ADD COLUMN IF NOT EXISTS reason text;

-- AI Fitness Plans table
CREATE TABLE IF NOT EXISTS public.ai_fitness_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  goal text NOT NULL, -- 'weight_loss' | 'weight_gain' | 'muscle_gain' | 'maintain'
  current_weight numeric NOT NULL,
  target_weight numeric NOT NULL,
  height_cm numeric NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  activity_level text NOT NULL DEFAULT 'moderate',
  duration_days integer NOT NULL DEFAULT 60,
  plan_data jsonb NOT NULL, -- { summary, daily_calories, weekly_schedule: [{day, focus, exercises:[{name,sets,reps,notes}], rest}], diet_tips[], notes }
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_fitness_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members view own plan" ON public.ai_fitness_plans
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Members create own plan" ON public.ai_fitness_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members update own plan" ON public.ai_fitness_plans
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Members delete own plan" ON public.ai_fitness_plans
  FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins manage plans" ON public.ai_fitness_plans
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_ai_plans_updated
  BEFORE UPDATE ON public.ai_fitness_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_ai_plans_user ON public.ai_fitness_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON public.attendance(user_id, checked_in_at);