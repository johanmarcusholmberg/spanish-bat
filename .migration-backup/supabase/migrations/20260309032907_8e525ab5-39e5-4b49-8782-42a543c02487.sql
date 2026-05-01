
-- Grammar lesson progress per user
CREATE TABLE public.grammar_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  best_score INTEGER NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE public.grammar_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own grammar progress" ON public.grammar_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own grammar progress" ON public.grammar_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own grammar progress" ON public.grammar_progress FOR UPDATE USING (auth.uid() = user_id);

-- Flashcard SRS state per user per card
CREATE TABLE public.flashcard_srs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_id TEXT NOT NULL,
  interval_days INTEGER NOT NULL DEFAULT 1,
  next_review TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ease INTEGER NOT NULL DEFAULT 2,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, card_id)
);

ALTER TABLE public.flashcard_srs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own SRS" ON public.flashcard_srs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own SRS" ON public.flashcard_srs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own SRS" ON public.flashcard_srs FOR UPDATE USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_grammar_progress_updated_at BEFORE UPDATE ON public.grammar_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_flashcard_srs_updated_at BEFORE UPDATE ON public.flashcard_srs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
