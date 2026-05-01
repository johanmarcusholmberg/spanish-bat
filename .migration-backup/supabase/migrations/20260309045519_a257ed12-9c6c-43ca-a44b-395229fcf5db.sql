CREATE TABLE public.user_vocabulary (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  spanish TEXT NOT NULL,
  translation TEXT NOT NULL,
  context TEXT,
  category TEXT DEFAULT 'conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, spanish)
);

ALTER TABLE public.user_vocabulary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vocabulary" ON public.user_vocabulary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vocabulary" ON public.user_vocabulary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vocabulary" ON public.user_vocabulary
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vocabulary" ON public.user_vocabulary
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_user_vocabulary_updated_at
  BEFORE UPDATE ON public.user_vocabulary
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();