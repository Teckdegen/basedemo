import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccount, useSendTransaction } from "wagmi";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { parseEther } from "viem";

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

type BountyEntry = {
  id: string;
  bounty_id: string;
  user_id: string;
  wallet_address: string;
  paid: boolean;
  tx_hash: string | null;
  created_at: string;
};

const ADMIN_WALLET = "0xC87646B4B86f92b7d39b6c128CA402f9662B7988";

function useBounties() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBounties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bounties")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Error loading bounties", description: error.message });
    } else {
      setBounties(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBounties();
  }, []);

  return { bounties, loading, fetchBounties };
}

function useBountyEntries(bountyId: string) {
  const [entries, setEntries] = useState<BountyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bounty_entries")
      .select("*")
      .eq("bounty_id", bountyId)
      .order("created_at", { ascending: true });
    if (error) {
      toast({ title: "Error loading entries", description: error.message });
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (bountyId) fetchEntries();
    // eslint-disable-next-line
  }, [bountyId]);

  return { entries, loading, fetchEntries };
}

const BountiesPage = () => {
  const { user, profile } = useAuth();
  const { address, isConnected } = useAccount();
  const navigate = useNavigate();

  const { bounties, loading: bountiesLoading, fetchBounties } = useBounties();
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState<{ title: string; description: string; entry_price: number }>({
    title: "",
    description: "",
    entry_price: 2,
  });

  const isAdmin = profile?.wallet_address?.toLowerCase() === ADMIN_WALLET.toLowerCase();

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const { error } = await supabase.from("bounties").insert({
      created_by: profile?.wallet_address,
      title: form.title,
      description: form.description,
      entry_price: Number(form.entry_price),
    });
    if (error) {
      toast({ title: "Create failed", description: error.message });
    } else {
      toast({ title: "Bounty created!" });
      setForm({ title: "", description: "", entry_price: 2 });
      fetchBounties();
    }
    setCreating(false);
  };

  const handleJoinBounty = async (bounty: Bounty) => {
    if (!profile) {
      toast({ title: "Sign in to join bounty" });
      return;
    }

    if (!isConnected || !address) {
      toast({ title: "Connect wallet", description: "Please connect your wallet to join the bounty." });
      return;
    }

    // Check if already joined
    const { data: existing, error } = await supabase
      .from("bounty_entries")
      .select("*")
      .eq("bounty_id", bounty.id)
      .eq("user_id", profile.id)
      .maybeSingle();
    
    if (existing) {
      toast({ title: "Already joined", description: "You've already entered this bounty." });
      return;
    }

    // Insert entry first
    const { error: insertError } = await supabase.from("bounty_entries").insert({
      bounty_id: bounty.id,
      user_id: profile.id,
      wallet_address: profile.wallet_address,
      paid: false,
    });

    if (insertError) {
      toast({ title: "Error joining", description: insertError.message });
      return;
    }

    // Show success and payment instruction
    toast({ 
      title: "Joined bounty!", 
      description: `Now send ${bounty.entry_price} BASE to the admin wallet to complete your entry.` 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 pb-4">
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/wallet")} className="mr-2">
            ← Back to Wallet
          </Button>
          <h1 className="text-3xl font-bold text-white">Bounties</h1>
        </div>

        {isAdmin && (
          <form className="bg-white/5 p-4 mb-8 rounded-2xl border border-cyan-700/20 shadow"
            onSubmit={handleCreateBounty}>
            <h2 className="text-xl font-bold text-cyan-300 mb-2">Create Bounty</h2>
            <input
              className="w-full bg-slate-900 text-white border border-cyan-400/20 rounded p-2 mb-2"
              required
              placeholder="Title"
              value={form.title}
              onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
            />
            <textarea
              className="w-full bg-slate-900 text-white border border-cyan-400/20 rounded p-2 mb-2"
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(s => ({ ...s, description: e.target.value }))}
            />
            <input
              className="w-full bg-slate-900 text-white border border-cyan-400/20 rounded p-2 mb-2"
              required
              type="number"
              min={0.01}
              step={0.01}
              placeholder="Entry price (BASE)"
              value={form.entry_price}
              onChange={e => setForm(s => ({ ...s, entry_price: Number(e.target.value) }))}
            />
            <Button type="submit" disabled={creating}>
              {creating ? "Creating..." : "Create Bounty"}
            </Button>
          </form>
        )}

        {bountiesLoading ? (
          <div className="text-white">Loading bounties...</div>
        ) : (
          <div className="flex flex-col gap-6">
            {bounties.length === 0 && (
              <div className="text-cyan-200 opacity-80">No active bounties yet.</div>
            )}
            {bounties.map(bounty => (
              <BountyCard
                key={bounty.id}
                bounty={bounty}
                userId={profile?.id}
                adminWallet={ADMIN_WALLET}
                onJoin={() => handleJoinBounty(bounty)}
                onDetail={() => navigate(`/bounties/${bounty.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function BountyCard({
  bounty,
  userId,
  adminWallet,
  onJoin,
  onDetail,
}: {
  bounty: Bounty;
  userId?: string;
  adminWallet: string;
  onJoin: () => void;
  onDetail: () => void;
}) {
  const { entries, loading, fetchEntries } = useBountyEntries(bounty.id);
  const { address, isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const alreadyJoined = !!entries.find(e => e.user_id === userId);

  const handleSendPayment = async () => {
    if (!isConnected || !address) {
      toast({ title: "Connect wallet", description: "Please connect your wallet first." });
      return;
    }

    try {
      await sendTransaction({
        to: adminWallet as `0x${string}`,
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

  return (
    <div className="bg-slate-800/80 rounded-xl border border-cyan-400/10 p-4 shadow-xl">
      <div className="flex items-center justify-between mb-2 cursor-pointer" onClick={onDetail}>
        <span className="block text-xl font-semibold text-cyan-200">{bounty.title}</span>
        <span className="text-base text-cyan-300 font-bold border border-cyan-400/50 px-3 py-1 rounded-full bg-black/20">{bounty.entry_price} BASE</span>
      </div>
      <div className="text-white/90 mb-2">{bounty.description}</div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-blue-400">
          Created by: {bounty.created_by === adminWallet ? "Admin" : bounty.created_by}
        </span>
        <span className="text-xs text-slate-500 ml-4">{new Date(bounty.created_at).toLocaleString()}</span>
      </div>
      <div className="mb-2">
        {loading ? (
          <span className="text-xs text-slate-300">Loading entries...</span>
        ) : (
          <div>
            <span className="text-xs text-cyan-300">Joined ({entries.length}):</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {entries.map(entry => (
                <span
                  key={entry.id}
                  className="text-[10px] px-2 py-[2px] border border-cyan-500/40 rounded bg-cyan-950 text-cyan-300"
                  title={entry.wallet_address}
                >
                  {entry.wallet_address.substring(0, 8)}...
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-col gap-2">
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-cyan-700/80 text-white"
            disabled={alreadyJoined}
            onClick={onJoin}
          >
            {alreadyJoined ? "Already Joined" : "Join Bounty"}
          </Button>
          {alreadyJoined && isConnected && (
            <Button
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleSendPayment}
            >
              Send Payment
            </Button>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-cyan-200">Pay {bounty.entry_price} BASE to:</span>
          <span className="text-xs font-mono text-green-300 border rounded px-1 py-1 bg-slate-900 whitespace-nowrap">
            {adminWallet}
          </span>
        </div>
      </div>
    </div>
  );
}

export default BountiesPage;
