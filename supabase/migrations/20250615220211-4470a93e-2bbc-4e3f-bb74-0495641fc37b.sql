
-- Add duration and min_participants columns to bounties table
ALTER TABLE public.bounties
ADD COLUMN IF NOT EXISTS duration_hours INTEGER,
ADD COLUMN IF NOT EXISTS min_participants INTEGER NOT NULL DEFAULT 10;

-- Make end_time nullable for new tasks that use duration
ALTER TABLE public.bounties
ALTER COLUMN end_time DROP NOT NULL;

-- For existing tasks, calculate and set a duration and make the column required
UPDATE public.bounties
SET duration_hours = CEIL(EXTRACT(EPOCH FROM (end_time - created_at)) / 3600)
WHERE duration_hours IS NULL;

UPDATE public.bounties
SET duration_hours = 24
WHERE duration_hours IS NULL OR duration_hours <= 0;

ALTER TABLE public.bounties
ALTER COLUMN duration_hours SET NOT NULL;

-- Function to start bounty when enough participants join
CREATE OR REPLACE FUNCTION public.check_and_start_bounty()
RETURNS TRIGGER AS $$
DECLARE
  bounty_record RECORD;
  entry_count INTEGER;
BEGIN
  -- Get the bounty details for the new entry
  SELECT * INTO bounty_record FROM public.bounties WHERE id = NEW.bounty_id;

  -- If bounty already started or doesn't exist, do nothing
  IF NOT FOUND OR bounty_record.start_time IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Count participants for this bounty
  SELECT count(*) INTO entry_count FROM public.bounty_entries WHERE bounty_id = NEW.bounty_id;

  -- Check if min participants reached
  IF entry_count >= bounty_record.min_participants THEN
    -- Start the bounty
    UPDATE public.bounties
    SET
      start_time = NOW(),
      end_time = NOW() + (bounty_record.duration_hours * INTERVAL '1 hour')
    WHERE id = NEW.bounty_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_bounty_entry_insert ON public.bounty_entries;

-- Trigger this function after a new entry is inserted
CREATE TRIGGER on_bounty_entry_insert
AFTER INSERT ON public.bounty_entries
FOR EACH ROW
EXECUTE FUNCTION public.check_and_start_bounty();
