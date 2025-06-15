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
import { useLocalWallet } from '@/hooks/useLocalWallet';

const Wallet = () => {
  // Use local wallet logic
  const { baseBalance, holdings, trades, reset } = useLocalWallet();
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

  // ... keep nav and header code ...
  // Just use baseBalance for summary:
  // Balance: {baseBalance.toFixed(2)} USDC

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 pb-4">
      {/* Header nav bar */}
      <nav className="sticky top-0 z-50 w-full px-2 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10 flex flex-row gap-2 sm:gap-4 items-center overflow-x-auto transition-all">
        {/* Back button, left */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/app'}
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
          onClick={() => window.location.href = '/pnl'}
          className="flex items-center gap-2 text-white hover:bg-white/10 rounded-xl px-2"
        >
          <TrendingUp className="w-4 h-4" />
          <span className="hidden md:inline-block">View PNL</span>
        </Button>
        {/* Bounties link */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.location.href = '/bounties'}
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
              Balance: {baseBalance.toFixed(2)}
            </span>
            <span className="text-white text-xs font-semibold" style={{ letterSpacing: 0.2 }}>USDC</span>
          </div>
        </div>
        {/* USDC price / hardcoded */}
        <div className="flex-shrink-0 ml-1">
          <div className="rounded-xl px-4 py-2 bg-gradient-to-br from-slate-800/80 to-blue-900/70 flex items-center gap-2 min-w-[120px] shadow border border-green-400/20">
            <span className="text-green-400 text-xs font-bold">USDC:</span>
            <span className="text-green-300 text-xs font-extrabold">${baseBalance.toFixed(2)}</span>
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
              balance={baseBalance} 
              portfolio={portfolioData} 
              tokenDetails={tokenDetails}
              basePrice={1} // 1 USDC = $1 always
              onTokenClick={(tokenAddress) => window.location.href = `/trade/${tokenAddress}`}
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
              {trades.length === 0 ?
                <>No trades yet. You start with 1500 USDC in BASE—go trade!</>
                :
                <ul>
                  {trades.map((t) => (
                    <li key={t.id} className="text-xs text-white/80">
                      [{t.created_at.slice(0,19).replace('T', ' ')}] {t.trade_type.toUpperCase()} {t.amount.toFixed(4)} {t.token_symbol} @ {(t.price_per_token).toFixed(6)} for {(t.total_base).toFixed(4)} BASE
                    </li>
                  ))}
                </ul>
              }
            </div>
            {/* Optional: a button to reset the wallet */}
            <button
              className="mt-2 w-full text-xs text-cyan-400 bg-slate-900/40 rounded px-2 py-1 border border-cyan-400/20 hover:bg-cyan-400/10"
              onClick={reset}
            >
              Reset Wallet (Demo)
            </button>
          </WalletCard>
        </div>
      </main>
    </div>
  );
};

export default Wallet;
