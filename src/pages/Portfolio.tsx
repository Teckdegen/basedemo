
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

const PortfolioPage = () => {
  const { profile, holdings, trades, loading } = useSupabaseData();
  const { user, loading: authLoading } = useAuth();
  const { isConnected } = useAccount();
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
      <div className="min-h-screen" style={{ background: '#6366f1' }}>
        <div className="flex items-center justify-center min-h-screen text-white text-xl">
          Loading portfolio...
        </div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!isConnected || !user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: '#6366f1' }}>
      {/* Header nav bar */}
      <nav className="sticky top-0 z-50 w-full px-6 py-4 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/trade')}
              className="flex items-center gap-2 text-white hover:bg-white/10 rounded-xl px-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline-block">Back to Trading</span>
            </Button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-blue-600 font-black text-lg">BD</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
                <div className="absolute top-2 -right-2 w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-2xl font-bold text-white">Portfolio</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/pnl')}
              className="flex items-center gap-2 text-white hover:bg-white/10 rounded-xl px-3"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:inline-block">View PNL</span>
            </Button>
            
            <div className="bg-white/20 rounded-xl px-4 py-2 text-white">
              <span className="text-sm font-medium">
                Balance: {profile?.base_balance?.toFixed(2) || '0.00'} USDC
              </span>
            </div>
            
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Portfolio Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Portfolio Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-bold text-blue-900">Portfolio</span>
            </div>
            <Portfolio 
              balance={profile?.base_balance || 0} 
              portfolio={portfolioData} 
              tokenDetails={tokenDetails}
              basePrice={1}
              onTokenClick={(tokenAddress) => navigate(`/trade/${tokenAddress}`)}
              coinLabel="USDC"
            />
          </div>
          
          {/* Trade History Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ArrowLeft className="w-5 h-5 text-blue-600 transform rotate-45" />
              <span className="text-lg font-bold text-blue-900">Trade History</span>
            </div>
            <div className="text-blue-700 mt-5 mb-10 text-center">
              {trades.length === 0 ? (
                <>No trades yet. You start with 1500 USDC—go trade!</>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {trades.slice(0, 10).map((trade) => (
                    <div key={trade.id} className="text-xs text-blue-900 p-2 bg-blue-50 rounded border border-blue-200">
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trade.trade_type === 'buy' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {trade.trade_type.toUpperCase()}
                        </span>
                        <span className="text-blue-800">
                          {trade.amount.toFixed(4)} {trade.token_symbol}
                        </span>
                      </div>
                      <div className="text-blue-600 text-xs mt-1">
                        @ {trade.price_per_token.toFixed(6)} for {trade.total_base.toFixed(4)} USDC
                      </div>
                      <div className="text-blue-500 text-xs">
                        {new Date(trade.created_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* AI Chat (wallet-aware) */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
          <AiChat walletInfo={walletInfo} />
        </div>
      </main>
    </div>
  );
};

export default PortfolioPage;
