CREATE TABLE public.user_last_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_type text NOT NULL,
  exercise_path text NOT NULL,
  exercise_label text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_last_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own last activity" ON public.user_last_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own last activity" ON public.user_last_activity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own last activity" ON public.user_last_activity FOR UPDATE USING (auth.uid() = user_id);