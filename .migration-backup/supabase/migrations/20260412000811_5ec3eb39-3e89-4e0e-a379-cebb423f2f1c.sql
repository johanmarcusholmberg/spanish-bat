
-- Add support ticket tracking to contact_messages
ALTER TABLE public.contact_messages 
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS admin_notes text,
  ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now();

-- Add account_status to profiles for subscription readiness
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'free';

-- Create admin audit log
CREATE TABLE public.admin_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id uuid NOT NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  metadata jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
  ON public.admin_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert audit logs"
  ON public.admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create app_settings table for backend config
CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  description text,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view app settings"
  ON public.app_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can manage app settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Index for audit log queries
CREATE INDEX idx_admin_audit_log_created ON public.admin_audit_log (created_at DESC);
CREATE INDEX idx_admin_audit_log_admin ON public.admin_audit_log (admin_user_id);

-- Index for contact message status filtering
CREATE INDEX idx_contact_messages_status ON public.contact_messages (status);

-- Allow admins to update contact messages (for status changes)
CREATE POLICY "Admins can update contact messages"
  ON public.contact_messages FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
