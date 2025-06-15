
-- Remove the specific admin wallet insert restriction and allow any authenticated user to insert bounties.
DROP POLICY IF EXISTS "Only address 0xC876... can insert bounties" ON public.bounties;

CREATE POLICY "Any authenticated user can insert bounties"
  ON public.bounties
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);
