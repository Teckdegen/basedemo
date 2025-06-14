
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type Bounty = {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  entry_price: number;
  start_time?: string | null;
  end_time?: string | null;
  winner_wallet?: string | null;
  mystery_prize?: string | null;
  created_at: string;
};
type Entry = {
  id: string;
  wallet_address: string;
  paid: boolean;
  created_at: string;
};

export default function BountyDetailPage() {
  const { bountyId } = useParams();
  const navigate = useNavigate();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBounty() {
      setLoading(true);
      const { data, error } = await supabase.from("bounties").select("*").eq("id", bountyId).maybeSingle();
      if (error || !data) {
        setBounty(null);
        setLoading(false);
        return;
      }
      setBounty(data);
      // Fetch entries
      const { data: entryData } = await supabase
        .from("bounty_entries")
        .select("id,wallet_address,paid,created_at")
        .eq("bounty_id", bountyId)
        .order("created_at", { ascending: true });
      setEntries(entryData || []);
      setLoading(false);
    }
    fetchBounty();
  }, [bountyId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">Loading...</div>;
  }

  if (!bounty) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
        <Button onClick={() => navigate("/bounties")} className="mb-6">← Back to bounties</Button>
        <div>Sorry, bounty not found.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-slate-800/80 rounded-xl border border-cyan-400/10 p-6 shadow-xl">
        <Button variant="ghost" onClick={() => navigate("/bounties")} className="mb-4">&larr; Back</Button>
        <h1 className="text-3xl font-bold text-cyan-200 mb-2">{bounty.title}</h1>
        <div className="text-white/90 mb-4">{bounty.description}</div>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <span className="text-base text-cyan-300 font-bold border border-cyan-400/50 px-3 py-1 rounded-full bg-black/20">{bounty.entry_price} BASE Entry</span>
          {bounty.winner_wallet && (
            <span className="text-green-300 border border-green-400 px-3 py-1 rounded-full bg-black/20">
              Winner: {bounty.winner_wallet}
            </span>
          )}
        </div>
        <div className="mb-4">
          <span className="text-cyan-300 text-sm">Created: {new Date(bounty.created_at).toLocaleString()}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-cyan-400 mb-1">Entries ({entries.length})</h2>
          <div className="flex flex-wrap gap-2">
            {entries.length === 0 && <span className="text-xs text-slate-300">No entries yet.</span>}
            {entries.map(entry => (
              <span
                key={entry.id}
                className={`text-[11px] px-3 py-[3px] border rounded ${entry.paid ? "border-green-400 bg-green-950 text-green-300" : "border-cyan-400 bg-cyan-950 text-cyan-300"}`}
                title={entry.wallet_address}
              >
                {entry.wallet_address.substring(0, 8)}... {entry.paid ? "✅" : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

