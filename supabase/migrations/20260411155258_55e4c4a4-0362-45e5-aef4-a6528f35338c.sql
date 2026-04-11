
-- Add room detail columns
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS area numeric NULL;
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS window_type text NOT NULL DEFAULT 'window';
