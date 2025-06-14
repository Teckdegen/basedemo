
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
      console.log('Fetching profile for user:', user.id);
      
      // First, try to fetch existing profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      console.log('Profile query result:', { profileData, profileError });

      // If no profile exists and no error, create one
      if (!profileData && !profileError) {
        console.log('No profile found, creating new profile for user:', user.id);
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            base_balance: 1.0,
            wallet_address: null
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          
          // If insert failed due to unique constraint, try to fetch again
          if (insertError.code === '23505') {
            console.log('Profile might exist, trying to fetch again...');
            const { data: retryProfile, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle();
            
            if (retryProfile && !retryError) {
              profileData = retryProfile;
              console.log('Found existing profile on retry:', retryProfile);
            } else {
              console.error('Still unable to fetch profile:', retryError);
            }
          }
        } else {
          profileData = newProfile;
          console.log('Created new profile successfully:', newProfile);
        }
      } else if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Ensure we have a valid profile
      if (profileData) {
        // Make sure base_balance is a number and has a default value
        const validProfile = {
          ...profileData,
          base_balance: profileData.base_balance ? Number(profileData.base_balance) : 1.0
        };
        setProfile(validProfile);
        console.log('Profile set successfully:', validProfile);
      } else {
        console.error('No profile data available after all attempts');
        // Create a fallback profile in state only
        const fallbackProfile = {
          id: user.id,
          wallet_address: null,
          base_balance: 1.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(fallbackProfile);
        console.log('Using fallback profile:', fallbackProfile);
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
        console.log('Holdings set:', holdingsData);
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
        console.log('Trades set:', typedTrades);
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
      // Even on error, ensure we have a fallback profile
      if (user && !profile) {
        const fallbackProfile = {
          id: user.id,
          wallet_address: null,
          base_balance: 1.0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(fallbackProfile);
        console.log('Using error fallback profile:', fallbackProfile);
      }
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
          base_balance: data.base_balance ? Number(data.base_balance) : 1.0
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

      console.log('Trade inserted successfully:', tradeData);

      // Update or insert holding
      const existingHolding = holdings.find(h => h.token_address === tokenAddress);
      
      if (tradeType === 'buy') {
        const newAmount = (existingHolding?.amount || 0) + amount;
        const newTotalInvested = (existingHolding?.total_invested || 0) + totalBase;
        const newAverageBuyPrice = newAmount > 0 ? newTotalInvested / newAmount : 0;

        const { error: holdingError } = await supabase
          .from('user_holdings')
          .upsert({
            user_id: user.id,
            token_address: tokenAddress,
            token_symbol: tokenSymbol,
            token_name: tokenName,
            amount: newAmount,
            average_buy_price: newAverageBuyPrice,
            total_invested: newTotalInvested
          }, { onConflict: 'user_id, token_address' });

        if (holdingError) {
          console.error('Holding upsert error:', holdingError);
          throw holdingError;
        }

        // Update profile balance
        const newBalance = profile.base_balance - totalBase;
        console.log('Updating balance from', profile.base_balance, 'to', newBalance);
        
        const { error: balanceError } = await updateProfile({ base_balance: newBalance });
        if (balanceError) {
          console.error('Balance update error:', balanceError);
          throw balanceError;
        }
      } else {
        if (existingHolding) {
          const newAmount = existingHolding.amount - amount;
          const proportionSold = amount / existingHolding.amount;
          const newTotalInvested = existingHolding.total_invested * (1 - proportionSold);

          if (newAmount <= 0.000001) {
            const { error: deleteError } = await supabase
              .from('user_holdings')
              .delete()
              .eq('id', existingHolding.id);
            
            if (deleteError) {
              console.error('Holding delete error:', deleteError);
              throw deleteError;
            }
          } else {
            const { error: updateError } = await supabase
              .from('user_holdings')
              .update({
                amount: newAmount,
                total_invested: newTotalInvested
              })
              .eq('id', existingHolding.id);
            
            if (updateError) {
              console.error('Holding update error:', updateError);
              throw updateError;
            }
          }

          // Update profile balance
          const newBalance = profile.base_balance + totalBase;
          console.log('Updating balance from', profile.base_balance, 'to', newBalance);
          
          const { error: balanceError } = await updateProfile({ base_balance: newBalance });
          if (balanceError) {
            console.error('Balance update error:', balanceError);
            throw balanceError;
          }
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
