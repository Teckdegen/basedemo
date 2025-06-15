
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserProfile {
  id: string;
  wallet_address: string | null;
  base_balance: number;
  username: string | null;
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
      console.log('Fetching profile for user:', user.id);
      
      // Fetch or create profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (!profileData && !profileError) {
        console.log('No profile found, creating new profile for user:', user.id);
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            base_balance: 1500.0,
            wallet_address: null
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          if (insertError.code === '23505') {
            const { data: retryProfile, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            
            if (retryProfile && !retryError) {
              profileData = retryProfile;
            }
          }
        } else {
          profileData = newProfile;
        }
      }

      if (profileData) {
        const validProfile = {
          ...profileData,
          base_balance: profileData.base_balance ? Number(profileData.base_balance) : 1500.0
        };
        setProfile(validProfile);
        console.log('Profile set successfully:', validProfile);
      } else {
        const fallbackProfile = {
          id: user.id,
          wallet_address: null,
          base_balance: 1500.0,
          username: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(fallbackProfile);
      }

      // Fetch holdings
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('user_holdings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (holdingsError) {
        console.error('Error fetching holdings:', holdingsError);
      } else if (holdingsData) {
        setHoldings(holdingsData);
      }

      // Fetch trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (tradesError) {
        console.error('Error fetching trades:', tradesError);
      } else if (tradesData) {
        const typedTrades = tradesData.map(trade => ({
          ...trade,
          trade_type: trade.trade_type as 'buy' | 'sell'
        }));
        setTrades(typedTrades);
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
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
      if (data) {
        const validProfile = {
          ...data,
          base_balance: data.base_balance ? Number(data.base_balance) : 1500.0
        };
        setProfile(validProfile);
      }
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
    basePriceUsd: number,
    onPriceRefresh?: () => Promise<void>
  ) => {
    if (!user || !profile) {
      console.error('Cannot execute trade: missing user or profile');
      return { data: null, error: 'Missing user or profile' };
    }

    try {
      console.log('Executing trade:', {
        tokenAddress,
        tokenSymbol,
        tradeType,
        amount,
        pricePerToken,
        totalBase,
        currentBalance: profile.base_balance
      });

      // Check balance for buy orders
      if (tradeType === 'buy' && totalBase > profile.base_balance) {
        return { data: null, error: 'Insufficient USDC balance' };
      }

      // Check holdings for sell orders
      if (tradeType === 'sell') {
        const existingHolding = holdings.find(h => h.token_address === tokenAddress);
        if (!existingHolding || amount > existingHolding.amount) {
          return { data: null, error: 'Insufficient token balance' };
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

      if (tradeError) {
        console.error('Trade insert error:', tradeError);
        throw tradeError;
      }

      // Update or insert holding
      const existingHolding = holdings.find(h => h.token_address === tokenAddress);
      
      if (tradeType === 'buy') {
        if (existingHolding) {
          const newAmount = existingHolding.amount + amount;
          const newTotalInvested = existingHolding.total_invested + totalBase;
          const newAverageBuyPrice = newAmount > 0 ? newTotalInvested / newAmount : 0;

          const { error: holdingError } = await supabase
            .from('user_holdings')
            .update({
              amount: newAmount,
              average_buy_price: newAverageBuyPrice,
              total_invested: newTotalInvested,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingHolding.id);

          if (holdingError) throw holdingError;
        } else {
          const { error: holdingError } = await supabase
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

          if (holdingError) throw holdingError;
        }

        // Update profile balance (subtract for buy)
        const newBalance = profile.base_balance - totalBase;
        const { error: balanceError } = await updateProfile({ base_balance: newBalance });
        if (balanceError) throw balanceError;

      } else {
        // Sell order
        if (existingHolding) {
          const newAmount = existingHolding.amount - amount;
          const proportionSold = amount / existingHolding.amount;
          const investedInSold = existingHolding.total_invested * proportionSold;
          const newTotalInvested = existingHolding.total_invested - investedInSold;

          // Calculate profit/loss (totalBase - what was originally invested in this portion)
          const profit = totalBase - investedInSold;
          console.log(`Sell trade profit: ${profit.toFixed(4)} USDC (Sale: ${totalBase.toFixed(4)}, Original investment: ${investedInSold.toFixed(4)})`);

          if (newAmount <= 0.000001) {
            const { error: deleteError } = await supabase
              .from('user_holdings')
              .delete()
              .eq('id', existingHolding.id);
            
            if (deleteError) throw deleteError;
          } else {
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

          // Update profile balance (add sale proceeds including profit)
          const newBalance = profile.base_balance + totalBase;
          const { error: balanceError } = await updateProfile({ base_balance: newBalance });
          if (balanceError) throw balanceError;
        }
      }

      // Refresh data
      await fetchUserData();
      
      // Trigger price refresh if callback provided
      if (onPriceRefresh) {
        console.log('Refreshing prices after trade execution...');
        await onPriceRefresh();
      }
      
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
