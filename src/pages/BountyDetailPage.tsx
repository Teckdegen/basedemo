import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { BountyWinnerAnalysis } from "@/components/BountyWinnerAnalysis";
import { useAuth } from "@/hooks/useAuth";
import { useAccount, useSendTransaction } from "wagmi";
import { parseEther } from "viem";
import { toast } from "@/hooks/use-toast";

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

const ADMIN_WALLET = "0xC87646B4B86f92b7d39b6c128CA402f9662B7988";

export default function BountyDetailPage() {
  const { bountyId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { address, isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = profile?.wallet_address?.toLowerCase() === ADMIN_WALLET.toLowerCase();
  const userEntry = entries.find(e => e.wallet_address?.toLowerCase() === profile?.wallet_address?.toLowerCase());

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

  const handleSendPayment = async () => {
    if (!bounty || !isConnected || !address) {
      toast({ title: "Connect wallet", description: "Please connect your wallet first." });
      return;
    }

    try {
      await sendTransaction({
        to: ADMIN_WALLET as `0x${string}`,
        value: parseEther(bounty.entry_price.toString()),
      });
      
      toast({ 
        title: "Payment sent!", 
        description: "Your payment has been sent. It will be confirmed shortly." 
      });
    } catch (error) {
      console.error("Payment error:", error);
      toast({ 
        title: "Payment failed", 
        description: "There was an error sending your payment. Please try again." 
      });
    }
  };

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
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/bounties")} className="mb-4 text-white">&larr; Back</Button>
        
        <div className="bg-slate-800/80 rounded-xl border border-cyan-400/10 p-6 shadow-xl mb-6">
          <h1 className="text-3xl font-bold text-cyan-200 mb-2">{bounty.title}</h1>
          <div className="text-white/90 mb-4">{bounty.description}</div>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <span className="text-base text-cyan-300 font-bold border border-cyan-400/50 px-3 py-1 rounded-full bg-black/20">
              {bounty.entry_price} BASE Entry
            </span>
            {bounty.winner_wallet && (
              <span className="text-green-300 border border-green-400 px-3 py-1 rounded-full bg-black/20">
                Winner: {bounty.winner_wallet.substring(0, 8)}...
              </span>
            )}
          </div>
          <div className="mb-4">
            <span className="text-cyan-300 text-sm">Created: {new Date(bounty.created_at).toLocaleString()}</span>
          </div>
          
          {/* Basic Entry List */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-cyan-400 mb-2">Entries ({entries.length})</h2>
            <div className="flex flex-wrap gap-2">
              {entries.length === 0 && <span className="text-xs text-slate-300">No entries yet.</span>}
              {entries.map(entry => (
                <span
                  key={entry.id}
                  className={`text-[11px] px-3 py-[3px] border rounded ${
                    entry.paid ? "border-green-400 bg-green-950 text-green-300" : "border-cyan-400 bg-cyan-950 text-cyan-300"
                  }`}
                  title={entry.wallet_address}
                >
                  {entry.wallet_address.substring(0, 8)}... {entry.paid ? "✅" : ""}
                </span>
              ))}
            </div>
          </div>

          {/* Payment Instructions and Actions */}
          <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600/30">
            <h3 className="text-cyan-300 font-semibold mb-2">How to Enter:</h3>
            <p className="text-white/80 text-sm mb-2">
              1. Join the bounty by clicking "Join Bounty" on the bounties page
            </p>
            <p className="text-white/80 text-sm mb-2">
              2. Send {bounty.entry_price} BASE to the admin wallet:
            </p>
            <div className="bg-slate-900 p-2 rounded border font-mono text-xs text-green-300 break-all mb-4">
              {ADMIN_WALLET}
            </div>
            
            {userEntry && !userEntry.paid && isConnected && (
              <div className="mb-4">
                <Button 
                  onClick={handleSendPayment}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Send Payment ({bounty.entry_price} BASE)
                </Button>
              </div>
            )}
            
            <p className="text-white/80 text-sm">
              3. Once payment is confirmed, you'll be eligible for the bounty
            </p>
          </div>
        </div>

        {/* Winner Analysis Component */}
        <BountyWinnerAnalysis bountyId={bounty.id} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
