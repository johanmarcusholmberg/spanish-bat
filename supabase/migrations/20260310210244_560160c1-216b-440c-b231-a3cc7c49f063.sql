
ALTER TABLE public.user_vocabulary 
  ADD COLUMN IF NOT EXISTS learned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS item_type text NOT NULL DEFAULT 'word';
