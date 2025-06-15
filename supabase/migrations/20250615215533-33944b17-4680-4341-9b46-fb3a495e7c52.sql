
-- Make end_time required in the bounties table (which stores "tasks")
ALTER TABLE public.bounties 
ALTER COLUMN end_time SET NOT NULL;

-- Set a default end_time for any existing records that might have NULL
UPDATE public.bounties 
SET end_time = created_at + INTERVAL '7 days'
WHERE end_time IS NULL;
