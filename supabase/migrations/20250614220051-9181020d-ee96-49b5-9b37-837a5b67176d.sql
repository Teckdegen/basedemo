
-- Table for bounties (tasks)
CREATE TABLE public.bounties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by text NOT NULL,
  title text NOT NULL,
  description text,
  entry_price numeric NOT NULL,
  start_time timestamptz,
  end_time timestamptz,
  winner_wallet text,
  mystery_prize text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Only allow users with YOUR wallet to create bounties (using WITH CHECK for INSERT)
ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only address 0xC876... can insert bounties"
  ON public.bounties
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND wallet_address = '0xC87646B4B86f92b7d39b6c128CA402f9662B7988'
    )
  );

-- All users can view bounties
CREATE POLICY "Anyone can select bounties"
  ON public.bounties
  FOR SELECT
  USING (true);

-- Entries table: tracks who entered which bounty
CREATE TABLE public.bounty_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bounty_id uuid REFERENCES public.bounties(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  wallet_address text,
  paid boolean DEFAULT false,
  tx_hash text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Users can join only once per bounty
CREATE UNIQUE INDEX ON public.bounty_entries(bounty_id, user_id);

-- Only allow users to insert their own entry
ALTER TABLE public.bounty_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User can insert their own bounty entry"
  ON public.bounty_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User can view their own (and public) entries
CREATE POLICY "Select own or public bounty entries"
  ON public.bounty_entries
  FOR SELECT
  USING (user_id = auth.uid());

-- Winner updates (manual by admin address for now)
CREATE POLICY "Only admin can update winner info"
  ON public.bounties
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND wallet_address = '0xC87646B4B86f92b7d39b6c128CA402f9662B7988'
    )
  );
