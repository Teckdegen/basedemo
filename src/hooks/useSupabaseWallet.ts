
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type Holding = {
  id: string;
  user_id: string;
  token_address: string;
  token_name: string;
  token_symbol: string;
  amount: number;
  average_buy_price: number;
  total_invested: number;
  created_at: string;
  updated_at: string;
};

type Trade = {
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
};

export function useSupabaseWallet() {
  const { user, profile } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) {
      setHoldings([]);
      setTrades([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch holdings
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('user_holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (holdingsError) {
        console.error('Error fetching holdings:', holdingsError);
      } else {
        setHoldings(holdingsData || []);
      }

      // Fetch trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tradesError) {
        console.error('Error fetching trades:', tradesError);
      } else {
        const typedTrades = tradesData?.map(trade => ({
          ...trade,
          trade_type: trade.trade_type as 'buy' | 'sell'
        })) || [];
        setTrades(typedTrades);
      }
    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const executeTrade = useCallback(async (
    tokenAddress: string,
    tokenSymbol: string,
    tokenName: string,
    tradeType: 'buy' | 'sell',
    amount: number,
    pricePerToken: number,
    totalBase: number,
    basePriceUsd: number
  ) => {
    if (!user || !profile) {
      return { error: 'User not authenticated' };
    }

    try {
      // Check balance for buy orders
      if (tradeType === 'buy' && totalBase > profile.base_balance) {
        return { error: 'Insufficient USDC balance' };
      }

      // Check holdings for sell orders
      if (tradeType === 'sell') {
        const holding = holdings.find(h => h.token_address === tokenAddress);
        if (!holding || amount > holding.amount) {
          return { error: 'Insufficient token balance' };
        }
      }

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

      // Handle holdings and balance updates
      if (tradeType === 'buy') {
        // Find existing holding
        const existingHolding = holdings.find(h => h.token_address === tokenAddress);
        
        if (existingHolding) {
          // Update existing holding
          const newAmount = existingHolding.amount + amount;
          const newTotalInvested = existingHolding.total_invested + totalBase;
          const newAverageBuyPrice = newAmount > 0 ? newTotalInvested / newAmount : 0;

          const { error: updateError } = await supabase
            .from('user_holdings')
            .update({
              amount: newAmount,
              average_buy_price: newAverageBuyPrice,
              total_invested: newTotalInvested,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingHolding.id);

          if (updateError) throw updateError;
        } else {
          // Create new holding
          const { error: insertError } = await supabase
            .from('user_holdings')
            .insert({
              user_id: user.id,
              token_address: tokenAddress,
              token_symbol: tokenSymbol,
              token_name: tokenName,
              amount,
              average_buy_price: pricePerToken,
              total_invested: totalBase
            });

          if (insertError) throw insertError;
        }

        // Update user balance (subtract)
        const newBalance = profile.base_balance - totalBase;
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ base_balance: newBalance })
          .eq('id', user.id);

        if (balanceError) throw balanceError;

      } else {
        // Sell order
        const existingHolding = holdings.find(h => h.token_address === tokenAddress);
        if (!existingHolding) throw new Error('Holding not found');

        const newAmount = existingHolding.amount - amount;
        const proportionSold = amount / existingHolding.amount;
        const investedInSold = existingHolding.total_invested * proportionSold;
        const newTotalInvested = existingHolding.total_invested - investedInSold;

        // Calculate profit/loss
        const profit = totalBase - investedInSold;
        console.log(`Sell trade profit: ${profit.toFixed(4)} USDC`);

        if (newAmount <= 0.000001) {
          // Delete holding if amount is negligible
          const { error: deleteError } = await supabase
            .from('user_holdings')
            .delete()
            .eq('id', existingHolding.id);

          if (deleteError) throw deleteError;
        } else {
          // Update existing holding
          const { error: updateError } = await supabase
            .from('user_holdings')
            .update({
              amount: newAmount,
              total_invested: newTotalInvested,
              average_buy_price: newAmount > 0 ? newTotalInvested / newAmount : 0,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingHolding.id);

          if (updateError) throw updateError;
        }

        // Update user balance (add the total sale amount including profit)
        const newBalance = profile.base_balance + totalBase;
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ base_balance: newBalance })
          .eq('id', user.id);

        if (balanceError) throw balanceError;
      }

      // Refresh data
      await fetchData();
      
      return { error: null, data: tradeData };
    } catch (error) {
      console.error('Error executing trade:', error);
      return { error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [user, profile, holdings, fetchData]);

  return {
    holdings,
    trades,
    loading,
    executeTrade,
    refreshData: fetchData
  };
}
