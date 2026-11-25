CREATE TABLE public.rent_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  year integer NOT NULL,
  week integer NOT NULL CHECK (week BETWEEN 1 AND 52),
  amount numeric NOT NULL DEFAULT 0,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (room_id, year, week)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rent_payments TO authenticated;
GRANT ALL ON public.rent_payments TO service_role;
ALTER TABLE public.rent_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage rent payments" ON public.rent_payments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_rent_payments_updated_at BEFORE UPDATE ON public.rent_payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();