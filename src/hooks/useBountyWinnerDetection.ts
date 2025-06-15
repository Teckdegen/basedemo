
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLocalWallet } from './useLocalWallet';

interface BountyEntry {
  id: string;
  bounty_id: string;
  user_id: string;
  wallet_address: string;
  paid: boolean;
  created_at: string;
}

interface Bounty {
  id: string;
  title: string;
  description: string;
  entry_price: number;
  start_time?: string;
  end_time?: string;
  winner_wallet?: string;
  created_at: string;
}

interface UserPerformance {
  wallet_address: string;
  entry_time: string;
  profit_loss: number;
  starting_balance: number;
  current_balance: number;
  percentage_gain: number;
  trades_count: number;
}

export function useBountyWinnerDetection(bountyId: string) {
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [entries, setEntries] = useState<BountyEntry[]>([]);
  const [userPerformances, setUserPerformances] = useState<UserPerformance[]>([]);
  const [winner, setWinner] = useState<UserPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBountyData = async () => {
    setLoading(true);
    
    // Fetch bounty details
    const { data: bountyData, error: bountyError } = await supabase
      .from('bounties')
      .select('*')
      .eq('id', bountyId)
      .single();

    if (bountyError || !bountyData) {
      console.error('Error fetching bounty:', bountyError);
      setLoading(false);
      return;
    }

    setBounty(bountyData);

    // Fetch entries
    const { data: entriesData, error: entriesError } = await supabase
      .from('bounty_entries')
      .select('*')
      .eq('bounty_id', bountyId)
      .eq('paid', true); // Only paid entries

    if (entriesError) {
      console.error('Error fetching entries:', entriesError);
      setLoading(false);
      return;
    }

    setEntries(entriesData || []);

    // Calculate performance for each user
    if (entriesData && entriesData.length > 0) {
      await calculateUserPerformances(entriesData, bountyData);
    }

    setLoading(false);
  };

  const calculateUserPerformances = async (entries: BountyEntry[], bounty: Bounty) => {
    const performances: UserPerformance[] = [];
    
    for (const entry of entries) {
      // For demo purposes, we'll simulate user performance
      // In a real system, you'd track actual user trades and balances
      const performance = await calculateUserPerformance(entry, bounty);
      performances.push(performance);
    }

    // Sort by profit/loss descending to find winner
    performances.sort((a, b) => b.profit_loss - a.profit_loss);
    setUserPerformances(performances);
    
    if (performances.length > 0) {
      setWinner(performances[0]);
    }
  };

  const calculateUserPerformance = async (entry: BountyEntry, bounty: Bounty): Promise<UserPerformance> => {
    // Simulate realistic trading performance for demo
    const entryTime = new Date(entry.created_at);
    const now = new Date();
    const timeDiff = now.getTime() - entryTime.getTime();
    const hoursElapsed = timeDiff / (1000 * 60 * 60);
    
    // Generate realistic performance data
    const baseVariation = (Math.random() - 0.5) * 2000; // -1000 to +1000
    const timeBonus = Math.min(hoursElapsed * 50, 200); // Small time-based bonus
    const randomFactor = (Math.random() - 0.3) * 500; // Slight negative bias for realism
    
    const profit_loss = Math.round(baseVariation + timeBonus + randomFactor);
    const starting_balance = 1500;
    const current_balance = starting_balance + profit_loss;
    const percentage_gain = (profit_loss / starting_balance) * 100;
    const trades_count = Math.floor(Math.random() * 20) + 1;

    return {
      wallet_address: entry.wallet_address,
      entry_time: entry.created_at,
      profit_loss,
      starting_balance,
      current_balance,
      percentage_gain,
      trades_count
    };
  };

  const declareWinner = async () => {
    if (!winner || !bounty) return;

    const { error } = await supabase
      .from('bounties')
      .update({ winner_wallet: winner.wallet_address })
      .eq('id', bountyId);

    if (error) {
      console.error('Error declaring winner:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  };

  useEffect(() => {
    if (bountyId) {
      fetchBountyData();
    }
  }, [bountyId]);

  return {
    bounty,
    entries,
    userPerformances,
    winner,
    loading,
    declareWinner,
    refreshData: fetchBountyData
  };
}
