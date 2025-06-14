
import React, { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Portfolio from '@/components/Portfolio';
import TradeHistory from '@/components/TradeHistory';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, LogOut } from 'lucide-react';
import { useBasePrice } from '@/hooks/useBasePrice';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import UsernameOnboard from "@/components/UsernameOnboard";

const Wallet = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const { priceData: basePrice, loading: priceLoading, refreshPrice } = useBasePrice();
  const { user, signOut, profile, loading, needsUsername } = useAuth();
  const { holdings, trades } = useSupabaseData();

  useEffect(() => {
    if (!isConnected || !user) {
      navigate('/auth');
    }
  }, [isConnected, user, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Convert holdings to legacy format for Portfolio component
  const portfolioData = holdings.reduce((acc, holding) => {
    acc[holding.token_address] = holding.amount;
    return acc;
  }, {} as Record<string, number>);

  // Convert holdings to token details format
  const tokenDetails = holdings.reduce((acc, holding) => {
    acc[holding.token_address] = {
      address: holding.token_address,
      name: holding.token_name,
      symbol: holding.token_symbol,
      price: 0, // This would need to be fetched from current market data
      priceChange24h: 0
    };
    return acc;
  }, {} as Record<string, any>);

  // Convert trades to legacy format
  const legacyTrades = trades.map(trade => ({
    id: trade.id,
    tokenAddress: trade.token_address,
    tokenSymbol: trade.token_symbol,
    type: trade.trade_type as 'buy' | 'sell',
    amount: trade.amount,
    price: trade.price_per_token,
    total: trade.total_base,
    timestamp: new Date(trade.created_at).getTime()
  }));

  if (!isConnected || !user || loading) {
    return null;
  }
  
  // Show username onboard if needed
  if (needsUsername) {
    return <UsernameOnboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app')}
                className="flex items-center space-x-2 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Trading</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BD</span>
                </div>
                <span className="text-xl font-bold text-white hidden sm:block">My Wallet</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-cyan-400 text-sm font-medium">
                  Balance: {profile?.base_balance.toFixed(4) || '0.0000'} BASE
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                <span className="text-green-400 text-sm font-medium">
                  BASE: ${basePrice.usd.toFixed(2)}
                </span>
                <button 
                  onClick={refreshPrice} 
                  disabled={priceLoading}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${priceLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <Portfolio 
            balance={profile?.base_balance || 0} 
            portfolio={portfolioData} 
            tokenDetails={tokenDetails}
            basePrice={basePrice.usd}
            onTokenClick={(tokenAddress) => navigate(`/trade/${tokenAddress}`)}
          />
          <TradeHistory trades={legacyTrades} />
        </div>
      </div>
    </div>
  );
};

export default Wallet;
