
-- Add gender and date_of_birth to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Create issue_messages table for dialogue
CREATE TABLE public.issue_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id uuid NOT NULL REFERENCES public.issues(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  sender_role text NOT NULL DEFAULT 'tenant',
  message text NOT NULL DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.issue_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all issue messages"
  ON public.issue_messages FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Tenants can view messages on own issues"
  ON public.issue_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.issues
    WHERE issues.id = issue_messages.issue_id
    AND issues.reported_by = auth.uid()
  ));

CREATE POLICY "Tenants can create messages on own issues"
  ON public.issue_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.issues
      WHERE issues.id = issue_messages.issue_id
      AND issues.reported_by = auth.uid()
    )
  );

CREATE INDEX idx_issue_messages_issue_id ON public.issue_messages(issue_id);
