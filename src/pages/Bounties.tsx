import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAccount, useSendTransaction } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { parseEther } from "viem";
import { ArrowLeft, Trophy, Users, DollarSign, Clock, Sparkles, Zap, Star } from "lucide-react";

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
const BOUNTY_CREATION_FEE = 1; // 1 BASE to create a bounty

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
  const { sendTransaction } = useSendTransaction();
  const navigate = useNavigate();

  const { bounties, loading: bountiesLoading, fetchBounties } = useBounties();
  const [creating, setCreating] = useState(false);
  const [payingCreationFee, setPayingCreationFee] = useState(false);

  const [form, setForm] = useState<{ title: string; description: string; entry_price: number }>({
    title: "",
    description: "",
    entry_price: 2,
  });

  const isAdmin = profile?.wallet_address?.toLowerCase() === ADMIN_WALLET.toLowerCase();

  const handlePayCreationFee = async () => {
    if (!isConnected || !address) {
      toast({ title: "Connect wallet", description: "Please connect your wallet to create a bounty." });
      return;
    }

    setPayingCreationFee(true);
    try {
      await sendTransaction({
        to: ADMIN_WALLET as `0x${string}`,
        value: parseEther(BOUNTY_CREATION_FEE.toString()),
      });
      
      toast({ 
        title: "Payment sent!", 
        description: "Creation fee paid! You can now create your bounty." 
      });
      
      // After payment, create the bounty
      await handleCreateBounty();
    } catch (error) {
      console.error("Payment error:", error);
      toast({ 
        title: "Payment failed", 
        description: "There was an error sending your payment. Please try again." 
      });
    } finally {
      setPayingCreationFee(false);
    }
  };

  const handleCreateBounty = async () => {
    if (!profile) {
      toast({ title: "Sign in required", description: "Please sign in to create a bounty." });
      return;
    }

    setCreating(true);
    const { error } = await supabase.from("bounties").insert({
      created_by: profile.wallet_address,
      title: form.title,
      description: form.description,
      entry_price: Number(form.entry_price),
    });
    if (error) {
      toast({ title: "Create failed", description: error.message });
    } else {
      toast({ title: "Bounty created!", description: "Your bounty is live! It will start once 10+ people join." });
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

    toast({ 
      title: "Joined bounty!", 
      description: `Now send ${bounty.entry_price} BASE to complete your entry.` 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 pb-8">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-8 animate-fade-in">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/wallet")} 
            className="mr-4 text-white hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Wallet
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Bounties</h1>
              <p className="text-cyan-300">Compete and win prizes</p>
            </div>
          </div>
        </div>

        {/* Create Bounty Card */}
        <Card className="mb-8 bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-cyan-500/20 shadow-2xl backdrop-blur-sm animate-slide-up">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-white">Create New Bounty</span>
            </CardTitle>
            <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 p-3 rounded-lg border border-yellow-400/20">
              <Zap className="w-5 h-5" />
              <span className="text-sm font-medium">
                Pay {BOUNTY_CREATION_FEE} BASE to host • Starts when 10+ people join
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Bounty Title
                </label>
                <input
                  className="w-full bg-slate-900/80 text-white border border-cyan-400/30 rounded-lg p-4 
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all
                           placeholder:text-slate-400"
                  required
                  placeholder="Enter an exciting bounty title..."
                  value={form.title}
                  onChange={e => setForm(s => ({ ...s, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-300">Description</label>
                <textarea
                  className="w-full bg-slate-900/80 text-white border border-cyan-400/30 rounded-lg p-4 
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all
                           placeholder:text-slate-400 min-h-[100px] resize-none"
                  placeholder="Describe your bounty challenge..."
                  value={form.description}
                  onChange={e => setForm(s => ({ ...s, description: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-cyan-300 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Entry Price (BASE)
                </label>
                <input
                  className="w-full bg-slate-900/80 text-white border border-cyan-400/30 rounded-lg p-4 
                           focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                  required
                  type="number"
                  min={0.01}
                  step={0.01}
                  placeholder="2.0"
                  value={form.entry_price}
                  onChange={e => setForm(s => ({ ...s, entry_price: Number(e.target.value) }))}
                />
              </div>
              
              <Button 
                type="button"
                onClick={handlePayCreationFee}
                disabled={creating || payingCreationFee || !form.title.trim()}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 
                         text-white font-semibold py-6 rounded-lg shadow-lg transition-all duration-200 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {payingCreationFee ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Payment...
                  </div>
                ) : creating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Pay {BOUNTY_CREATION_FEE} BASE & Create Bounty
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Bounties List */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-bold text-white">Active Bounties</h2>
          </div>
          
          {bountiesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading bounties...
              </div>
            </div>
          ) : bounties.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700/50 text-center py-12">
              <CardContent>
                <Trophy className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-cyan-200 text-lg">No bounties yet.</p>
                <p className="text-slate-400">Create the first one above!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {bounties.map((bounty, index) => (
                <div 
                  key={bounty.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <BountyCard
                    bounty={bounty}
                    userId={profile?.id}
                    adminWallet={ADMIN_WALLET}
                    onJoin={() => handleJoinBounty(bounty)}
                    onDetail={() => navigate(`/bounties/${bounty.id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
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

  const canStart = entries.length >= 10;
  const bountyStatus = canStart ? "Ready to Start!" : `${entries.length}/10 to start`;

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
    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-cyan-400/20 shadow-xl 
                   hover:shadow-2xl hover:border-cyan-400/40 transition-all duration-300 
                   hover:transform hover:scale-[1.02] backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4 cursor-pointer" onClick={onDetail}>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 hover:text-cyan-300 transition-colors">
              {bounty.title}
            </h3>
            <p className="text-slate-300 mb-3 leading-relaxed">{bounty.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <div className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 
                          px-4 py-2 rounded-full shadow-lg">
              <DollarSign className="w-4 h-4 text-white" />
              <span className="text-white font-bold">{bounty.entry_price} BASE</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${
              canStart 
                ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            }`}>
              {bountyStatus}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2 text-blue-400">
            <span>Created by:</span>
            <span className="font-mono">
              {bounty.created_by === adminWallet ? "Admin" : `${bounty.created_by.substring(0, 8)}...`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <Clock className="w-4 h-4" />
            <span>{new Date(bounty.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Participants */}
        <div className="mb-4">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-300">
              <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
              Loading participants...
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-300">
                  Participants ({entries.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {entries.map(entry => (
                  <div
                    key={entry.id}
                    className="px-3 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded-full 
                             text-xs text-cyan-300 font-mono"
                    title={entry.wallet_address}
                  >
                    {entry.wallet_address.substring(0, 8)}...
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <Button
              size="sm"
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white transition-colors"
              disabled={alreadyJoined}
              onClick={onJoin}
            >
              {alreadyJoined ? "Already Joined" : "Join Bounty"}
            </Button>
            {alreadyJoined && isConnected && (
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 
                         hover:from-green-500 hover:to-emerald-500 text-white transition-all"
                onClick={handleSendPayment}
              >
                Send Payment
              </Button>
            )}
          </div>
          
          <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
            <div className="text-xs text-cyan-300 mb-1">Send payment to:</div>
            <div className="text-xs font-mono text-green-400 break-all bg-slate-800/50 p-2 rounded border">
              {adminWallet}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BountiesPage;
