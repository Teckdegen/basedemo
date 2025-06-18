
import React from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Portfolio from '@/components/Portfolio';
import TradeHistory from '@/components/TradeHistory';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, LogOut, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useIsMobile } from '@/hooks/use-mobile';
import { WalletCard } from "@/components/ui/WalletCard";
import { AiChat } from '@/components/AiChat';

const Wallet = () => {
  const { profile, holdings, trades, loading } = useSupabaseData();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Portfolio data
  const portfolioData: Record<string, number> = {};
  const tokenDetails: Record<string, any> = {};

  holdings.forEach((h) => {
    portfolioData[h.token_address] = h.amount;
    tokenDetails[h.token_address] = {
      address: h.token_address,
      name: h.token_name,
      symbol: h.token_symbol,
      price: 1,
      priceChange24h: 0,
    };
  });

  // Attach wallet info for AI
  const walletInfo = {
    balance: profile?.base_balance || 0,
    portfolio: portfolioData,
    tokenDetails: tokenDetails,
  };

  // Show loading while checking authentication
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading wallet...</div>
      </div>
    );
  }

  // Show authentication required if no user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-slate-300 mb-6">You need to be logged in to view your wallet and portfolio</p>
          <Button
            onClick={() => navigate('/')}
            className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-xl"
          >
            Go to Home Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 pb-4">
      {/* Header nav bar */}
      <nav className="sticky top-0 z-50 w-full px-2 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10 flex flex-row gap-2 sm:gap-4 items-center overflow-x-auto transition-all">
        {/* Back button, left */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white font-bold hover:bg-white/10 rounded-xl px-3"
          style={{ minWidth: 0 }}
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          <span className="hidden md:inline-block whitespace-nowrap">Back to Trading</span>
        </Button>
        {/* Avatar image */}
        <div className="flex-shrink-0 w-10 h-10 rounded-xl overflow-hidden border-2 border-cyan-400/70 shadow-lg bg-gradient-to-tr from-cyan-600 to-blue-900 mr-1">
          <img src="/photo-1721322800607-8c38375eef04" alt="Profile" className="object-cover h-full w-full" />
        </div>
        {/* Title */}
        <span className="text-2xl font-black text-white leading-tight drop-shadow">Wallet</span>
        {/* PNL link */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/pnl')}
          className="flex items-center gap-2 text-white hover:bg-white/10 rounded-xl px-2"
        >
          <TrendingUp className="w-4 h-4" />
          <span className="hidden md:inline-block">View PNL</span>
        </Button>
        {/* Tasks link */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/bounties')}
          className="flex items-center gap-2 text-cyan-400 hover:bg-white/10 rounded-xl px-2"
        >
          <span className="hidden md:inline-block">Tasks</span>
        </Button>
        {/* Spacer */}
        <div className="flex-1" />

        {/* Balance badge */}
        <div className="flex-shrink-0">
          <div className="rounded-xl px-4 py-2 bg-gradient-to-br from-slate-800/80 to-blue-900/70 flex flex-col items-center min-w-[110px] shadow border border-blue-600/30">
            <span className="text-cyan-400 text-xs font-medium leading-tight whitespace-nowrap">
              Balance: {profile?.base_balance?.toFixed(2) || '0.00'}
            </span>
            <span className="text-white text-xs font-semibold" style={{ letterSpacing: 0.2 }}>USDC</span>
          </div>
        </div>
        {/* USDC price / hardcoded */}
        <div className="flex-shrink-0 ml-1">
          <div className="rounded-xl px-4 py-2 bg-gradient-to-br from-slate-800/80 to-blue-900/70 flex items-center gap-2 min-w-[120px] shadow border border-green-400/20">
            <span className="text-green-400 text-xs font-bold">USDC:</span>
            <span className="text-green-300 text-xs font-extrabold">${profile?.base_balance?.toFixed(2) || '0.00'}</span>
          </div>
        </div>
      </nav>

      {/* Main Wallet Content */}
      <main className={`max-w-7xl mx-auto p-3 md:p-8`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7">
          {/* Portfolio Card */}
          <WalletCard className="w-full flex flex-col gap-4 h-fit">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-cyan-300" />
              <span className="text-lg font-bold text-white drop-shadow">Portfolio</span>
            </div>
            <Portfolio 
              balance={profile?.base_balance || 0} 
              portfolio={portfolioData} 
              tokenDetails={tokenDetails}
              basePrice={1}
              onTokenClick={(tokenAddress) => navigate(`/trade/${tokenAddress}`)}
              coinLabel="USDC"
            />
          </WalletCard>
          
          {/* Trade History Card */}
          <WalletCard className="w-full flex flex-col gap-4 h-fit">
            <div className="flex items-center gap-2 mb-3">
              <ArrowLeft className="w-5 h-5 text-blue-200 transform rotate-45" />
              <span className="text-lg font-bold text-white drop-shadow">Trade History</span>
            </div>
            <div className="text-slate-400 mt-5 mb-10 text-center">
              {trades.length === 0 ? (
                <>No trades yet. You start with 1500 USDC—go trade!</>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {trades.slice(0, 10).map((trade) => (
                    <div key={trade.id} className="text-xs text-white/80 p-2 bg-slate-800/30 rounded border border-slate-700/30">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trade.trade_type === 'buy' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.trade_type.toUpperCase()}
                        </span>
                        <span className="text-slate-300">
                          {trade.amount.toFixed(4)} {trade.token_symbol}
                        </span>
                      </div>
                      <div className="text-slate-400 text-xs mt-1">
                        @ {trade.price_per_token.toFixed(6)} for {trade.total_base.toFixed(4)} USDC
                      </div>
                      <div className="text-slate-500 text-xs">
                        {new Date(trade.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </WalletCard>
        </div>
        
        {/* AI Chat (wallet-aware) */}
        <div className="mt-8">
          <AiChat walletInfo={walletInfo} />
        </div>
      </main>
    </div>
  );
};

export default Wallet;
