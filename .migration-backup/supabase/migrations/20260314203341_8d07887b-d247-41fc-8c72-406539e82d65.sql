
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  email TEXT NOT NULL,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (even anonymous/logged out via service role, but we'll use anon)
CREATE POLICY "Anyone can insert contact messages"
  ON public.contact_messages
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can read contact messages"
  ON public.contact_messages
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
