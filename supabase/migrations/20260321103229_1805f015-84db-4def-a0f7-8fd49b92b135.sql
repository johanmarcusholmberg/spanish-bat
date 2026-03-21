ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS placement_test_completed boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS placement_test_score jsonb DEFAULT NULL;