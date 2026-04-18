
-- Add assigned_at to rooms
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS assigned_at timestamptz;

-- Tenant notes (admin-only incident log)
CREATE TABLE IF NOT EXISTS public.tenant_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  note text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'general',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.tenant_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage tenant notes"
  ON public.tenant_notes FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Room assignment history (for stay duration when no longer assigned)
CREATE TABLE IF NOT EXISTS public.room_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz
);

ALTER TABLE public.room_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage assignments"
  ON public.room_assignments FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Tenants view own assignments"
  ON public.room_assignments FOR SELECT
  USING (auth.uid() = tenant_id);

-- Trigger to log assignment changes on rooms.tenant_id
CREATE OR REPLACE FUNCTION public.handle_room_assignment_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If tenant changed
  IF (NEW.tenant_id IS DISTINCT FROM OLD.tenant_id) THEN
    -- Close old assignment
    IF OLD.tenant_id IS NOT NULL THEN
      UPDATE public.room_assignments
        SET ended_at = now()
        WHERE room_id = OLD.id AND tenant_id = OLD.tenant_id AND ended_at IS NULL;
    END IF;
    -- Open new assignment
    IF NEW.tenant_id IS NOT NULL THEN
      INSERT INTO public.room_assignments (room_id, tenant_id, started_at)
        VALUES (NEW.id, NEW.tenant_id, now());
      NEW.assigned_at := now();
    ELSE
      NEW.assigned_at := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS room_assignment_change ON public.rooms;
CREATE TRIGGER room_assignment_change
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_room_assignment_change();

-- Also handle initial INSERT with tenant
CREATE OR REPLACE FUNCTION public.handle_room_assignment_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.tenant_id IS NOT NULL THEN
    INSERT INTO public.room_assignments (room_id, tenant_id, started_at)
      VALUES (NEW.id, NEW.tenant_id, COALESCE(NEW.assigned_at, now()));
    IF NEW.assigned_at IS NULL THEN
      NEW.assigned_at := now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS room_assignment_insert ON public.rooms;
CREATE TRIGGER room_assignment_insert
  BEFORE INSERT ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_room_assignment_insert();

-- Backfill assigned_at + assignment rows for existing assigned rooms
UPDATE public.rooms SET assigned_at = COALESCE(assigned_at, updated_at) WHERE tenant_id IS NOT NULL AND assigned_at IS NULL;

INSERT INTO public.room_assignments (room_id, tenant_id, started_at)
SELECT id, tenant_id, COALESCE(assigned_at, updated_at)
FROM public.rooms r
WHERE tenant_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.room_assignments ra
    WHERE ra.room_id = r.id AND ra.tenant_id = r.tenant_id AND ra.ended_at IS NULL
  );
