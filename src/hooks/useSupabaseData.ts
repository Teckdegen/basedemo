
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserProfile {
  id: string;
  wallet_address: string | null;
  base_balance: number;
  created_at: string;
  updated_at: string;
}

interface UserHolding {
  id: string;
  user_id: string;
  token_address: string;
  token_symbol: string;
  token_name: string;
  amount: number;
  average_buy_price: number;
  total_invested: number;
  created_at: string;
  updated_at: string;
}

interface Trade {
  id: string;
  user_id: string;
  token_address: string;
  token_symbol: string;
  trade_type: 'buy' | 'sell';
  amount: number;
  price_per_token: number;
  total_base: number;
  base_price_usd: number;
  created_at: string;
}

export const useSupabaseData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [holdings, setHoldings] = useState<UserHolding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      setProfile(null);
      setHoldings([]);
      setTrades([]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      // Fetch holdings
      const { data: holdingsData } = await supabase
        .from('user_holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (holdingsData) {
        setHoldings(holdingsData);
      }

      // Fetch trades
      const { data: tradesData } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tradesData) {
        // Type assertion to ensure trade_type is properly typed
        const typedTrades = tradesData.map(trade => ({
          ...trade,
          trade_type: trade.trade_type as 'buy' | 'sell'
        }));
        setTrades(typedTrades);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      if (data) setProfile(data);
      return { data, error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { data: null, error };
    }
  };

  const executeTrade = async (
    tokenAddress: string,
    tokenSymbol: string,
    tokenName: string,
    tradeType: 'buy' | 'sell',
    amount: number,
    pricePerToken: number,
    totalBase: number,
    basePriceUsd: number
  ) => {
    if (!user || !profile) return;

    try {
      // Insert trade record
      const { data: tradeData, error: tradeError } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          token_address: tokenAddress,
          token_symbol: tokenSymbol,
          trade_type: tradeType,
          amount,
          price_per_token: pricePerToken,
          total_base: totalBase,
          base_price_usd: basePriceUsd
        })
        .select()
        .single();

      if (tradeError) throw tradeError;

      // Update or insert holding
      const existingHolding = holdings.find(h => h.token_address === tokenAddress);
      
      if (tradeType === 'buy') {
        const newAmount = (existingHolding?.amount || 0) + amount;
        const newTotalInvested = (existingHolding?.total_invested || 0) + totalBase;
        const newAverageBuyPrice = newAmount > 0 ? newTotalInvested / newAmount : 0;

        await supabase
          .from('user_holdings')
          .upsert({
            user_id: user.id,
            token_address: tokenAddress,
            token_symbol: tokenSymbol,
            token_name: tokenName,
            amount: newAmount,
            average_buy_price: newAverageBuyPrice,
            total_invested: newTotalInvested
          });

        // Update profile balance
        await updateProfile({ base_balance: profile.base_balance - totalBase });
      } else {
        if (existingHolding) {
          const newAmount = existingHolding.amount - amount;
          const proportionSold = amount / existingHolding.amount;
          const newTotalInvested = existingHolding.total_invested * (1 - proportionSold);

          if (newAmount <= 0) {
            await supabase
              .from('user_holdings')
              .delete()
              .eq('id', existingHolding.id);
          } else {
            await supabase
              .from('user_holdings')
              .update({
                amount: newAmount,
                total_invested: newTotalInvested
              })
              .eq('id', existingHolding.id);
          }

          // Update profile balance
          await updateProfile({ base_balance: profile.base_balance + totalBase });
        }
      }

      // Refresh data
      await fetchUserData();
      return { data: tradeData, error: null };
    } catch (error) {
      console.error('Error executing trade:', error);
      return { data: null, error };
    }
  };

  return {
    profile,
    holdings,
    trades,
    loading,
    updateProfile,
    executeTrade,
    refreshData: fetchUserData
  };
};
