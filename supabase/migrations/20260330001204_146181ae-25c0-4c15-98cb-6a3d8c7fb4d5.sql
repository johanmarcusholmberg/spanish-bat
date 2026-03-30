
ALTER TABLE public.user_vocabulary 
ADD COLUMN IF NOT EXISTS level text DEFAULT 'A1',
ADD COLUMN IF NOT EXISTS topic_tags text[] DEFAULT '{}';
