
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

// === STATIC WALLET LOGIC ===
const STATIC_BALANCE = 1500;
const STATIC_USD = 1500;

const Wallet = () => {
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const { holdings, trades, profile, loading: dataLoading } = useSupabaseData();
  const isMobile = useIsMobile();

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
      price: 1, // 1 USDC == 1 USD by definition now
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

  const loading = authLoading || dataLoading;

  if (!isConnected || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  const mainContentAnim = isMobile ? "animate-slide-in-right" : "animate-fade-in";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 pb-4">
      {/* Header nav bar */}
      <nav className="sticky top-0 z-50 w-full px-2 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10 flex flex-row gap-2 sm:gap-4 items-center overflow-x-auto transition-all">
        {/* Back button, left */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 text-white font-bold hover:bg-white/10 rounded-xl px-3"
          style={{ minWidth: 0 }}
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" />
          <span className="hidden md:inline-block whitespace-nowrap">Back to Trading</span>
        </Button>
        {/* Avatar image, using uploaded */}
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
        {/* Bounties link */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/bounties')}
          className="flex items-center gap-2 text-cyan-400 hover:bg-white/10 rounded-xl px-2"
        >
          <span className="hidden md:inline-block">Bounties</span>
        </Button>
        {/* Spacer */}
        <div className="flex-1" />

        {/* Balance badge */}
        <div className="flex-shrink-0">
          <div className="rounded-xl px-4 py-2 bg-gradient-to-br from-slate-800/80 to-blue-900/70 flex flex-col items-center min-w-[110px] shadow border border-blue-600/30">
            <span className="text-cyan-400 text-xs font-medium leading-tight whitespace-nowrap">
              Balance: {STATIC_BALANCE.toFixed(2)}
            </span>
            <span className="text-white text-xs font-semibold" style={{ letterSpacing: 0.2 }}>USDC</span>
          </div>
        </div>
        {/* USDC price / hardcoded */}
        <div className="flex-shrink-0 ml-1">
          <div className="rounded-xl px-4 py-2 bg-gradient-to-br from-slate-800/80 to-blue-900/70 flex items-center gap-2 min-w-[120px] shadow border border-green-400/20">
            <span className="text-green-400 text-xs font-bold">USDC:</span>
            <span className="text-green-300 text-xs font-extrabold">${STATIC_USD.toFixed(2)}</span>
          </div>
        </div>
        {/* Sign Out */}
        <Button
          variant="ghost"
          size="sm"
          onClick={async() => { await signOut(); navigate('/'); }}
          className="text-white hover:bg-white/10 rounded-xl px-2"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </Button>
        {/* Wallet Connect */}
        <div className="flex-shrink-0 ml-1">
          <ConnectButton />
        </div>
      </nav>

      {/* Main Wallet Content - Cards Layout with Anim, Responsive */}
      <main className={`${mainContentAnim} max-w-7xl mx-auto p-3 md:p-8`}>
        {/* Stacked on mobile, grid on large */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-7">
          {/* Portfolio Card */}
          <WalletCard className="w-full flex flex-col gap-4 h-fit">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-cyan-300" />
              <span className="text-lg font-bold text-white drop-shadow">Portfolio</span>
            </div>
            <Portfolio 
              balance={STATIC_BALANCE} 
              portfolio={portfolioData} 
              tokenDetails={tokenDetails}
              basePrice={1} // 1 USDC = $1
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
            <TradeHistory trades={legacyTrades} />
          </WalletCard>
        </div>
      </main>
    </div>
  );
};

export default Wallet;
