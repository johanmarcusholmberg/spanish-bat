
ALTER TABLE public.user_vocabulary
  ADD COLUMN IF NOT EXISTS review_state text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS next_review timestamp with time zone NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS ease_factor real NOT NULL DEFAULT 2.5,
  ADD COLUMN IF NOT EXISTS interval_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS review_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS correct_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS incorrect_count integer NOT NULL DEFAULT 0;
