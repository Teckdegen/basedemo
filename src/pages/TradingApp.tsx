
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TokenScanner from '@/components/TokenScanner';
import TrendingTokens from '@/components/TrendingTokens';
import { AiChat } from '@/components/AiChat';
import { Button } from '@/components/ui/button';
import { Wallet, User, TrendingUp, MessageCircle, Bot, BarChart3, Activity, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useIsMobile } from '@/hooks/use-mobile';
import { useBasePrice } from '@/hooks/useBasePrice';
import UsernameOnboard from '@/components/UsernameOnboard';
import MobileNav from '@/components/MobileNav';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";

const TradingApp = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { user, profile, loading: authLoading } = useAuth();
  const { profile: supabaseProfile, holdings, trades } = useSupabaseData();
  const { priceData: basePrice } = useBasePrice();
  const isMobile = useIsMobile();
  const [showUsernameOnboard, setShowUsernameOnboard] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  useEffect(() => {
    if (user && profile && !profile.username && !authLoading) {
      setShowUsernameOnboard(true);
    }
  }, [user, profile, authLoading]);

  const handleUsernameSet = () => {
    setShowUsernameOnboard(false);
  };

  const handleTokenSelect = (token: any) => {
    setSelectedToken(token);
  };

  const handleWalletClick = () => {
    console.log('Wallet button clicked, navigating to /demowallet');
    navigate('/demowallet');
  };

  const handlePnLClick = () => {
    console.log('PNL button clicked, navigating to /pnl');
    navigate('/pnl');
  };

  const handleTasksClick = () => {
    console.log('Tasks button clicked, navigating to /bounties');
    navigate('/bounties');
  };

  // Create comprehensive wallet info for AI with current market prices
  const walletInfo = supabaseProfile && holdings && basePrice ? {
    balance: supabaseProfile.base_balance,
    balanceUSD: supabaseProfile.base_balance * basePrice.usd,
    totalTrades: trades?.length || 0,
    portfolio: Object.fromEntries(holdings.map(h => [h.token_address, {
      amount: h.amount,
      symbol: h.token_symbol,
      name: h.token_name,
      averageBuyPrice: h.average_buy_price,
      totalInvested: h.total_invested,
      currentPrice: (() => {
        // Get current price from localStorage tokens
        const savedTokens = localStorage.getItem('scannedTokens');
        if (savedTokens) {
          const tokens = JSON.parse(savedTokens);
          const tokenData = tokens[h.token_address];
          if (tokenData) {
            return tokenData.price / basePrice.usd; // Convert to USDC terms
          }
        }
        return h.average_buy_price; // Fallback to avg buy price
      })(),
      currentValueUSDC: (() => {
        const savedTokens = localStorage.getItem('scannedTokens');
        if (savedTokens) {
          const tokens = JSON.parse(savedTokens);
          const tokenData = tokens[h.token_address];
          if (tokenData) {
            const currentPrice = tokenData.price / basePrice.usd;
            return h.amount * currentPrice;
          }
        }
        return h.amount * h.average_buy_price;
      })(),
      pnl: (() => {
        const savedTokens = localStorage.getItem('scannedTokens');
        if (savedTokens) {
          const tokens = JSON.parse(savedTokens);
          const tokenData = tokens[h.token_address];
          if (tokenData) {
            const currentPrice = tokenData.price / basePrice.usd;
            const currentValue = h.amount * currentPrice;
            return currentValue - h.total_invested;
          }
        }
        return 0;
      })()
    }])),
    tokenDetails: Object.fromEntries(holdings.map(h => [h.token_address, {
      address: h.token_address,
      name: h.token_name,
      symbol: h.token_symbol,
      price: h.average_buy_price,
      priceChange24h: 0
    }])),
    recentTrades: trades?.slice(0, 5).map(trade => ({
      symbol: trade.token_symbol,
      type: trade.trade_type,
      amount: trade.amount,
      price: trade.price_per_token,
      total: trade.total_base,
      date: trade.created_at
    })) || []
  } : null;

  if (authLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#6366f1' }}>
        <div className="flex items-center justify-center min-h-screen text-white text-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (showUsernameOnboard) {
    return <UsernameOnboard onFinish={handleUsernameSet} />;
  }

  return (
    <div className="min-h-screen" style={{ background: '#6366f1' }}>
      {/* Header */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          {/* Mobile hamburger menu */}
          {isMobile && <MobileNav />}
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-blue-600 font-black text-lg">BD</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
              <div className="absolute top-2 -right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Base Demo</span>
              <div className="text-blue-200 text-sm font-medium">Digital Trading Platform</div>
            </div>
          </div>
          
          {/* Desktop navigation */}
          {!isMobile && (
            <div className="flex gap-2 ml-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWalletClick}
                className="flex items-center gap-2 text-white hover:bg-white/10 rounded-xl px-3 py-2 font-medium"
              >
                <Wallet className="w-4 h-4" />
                Portfolio
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePnLClick}
                className="flex items-center gap-2 text-white hover:bg-white/10 rounded-xl px-3 py-2 font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                P&L
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTasksClick}
                className="flex items-center gap-2 text-white hover:bg-white/10 rounded-xl px-3 py-2 font-medium"
              >
                <Activity className="w-4 h-4" />
                Tasks
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {profile?.username && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <User className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">{profile.username}</span>
            </div>
          )}
          {supabaseProfile && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">{supabaseProfile.base_balance.toFixed(2)} USDC</span>
            </div>
          )}
          <div className="bg-white/10 rounded-xl backdrop-blur-sm overflow-hidden">
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* Left Column - Token Scanner and Trending */}
          <div className={`space-y-8 ${isMobile ? '' : 'lg:col-span-2'}`}>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🔍</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Token Scanner</h2>
              </div>
              <TokenScanner onTokenSelect={handleTokenSelect} />
            </div>
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Trending Tokens</h2>
              </div>
              <TrendingTokens onTokenSelect={handleTokenSelect} />
            </div>
          </div>
          
          {/* Right Column - AI Chat */}
          <div className={`${isMobile ? '' : 'lg:col-span-1'}`}>
            {isMobile ? (
              <>
                <Dialog open={aiChatOpen} onOpenChange={setAiChatOpen}>
                  <DialogTrigger asChild>
                    <button
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 py-4 px-6 rounded-2xl font-semibold mb-4 flex items-center justify-center gap-3 transition-all duration-200 shadow-xl"
                    >
                      <Bot className="w-5 h-5" />
                      Open AI Trading Assistant
                    </button>
                  </DialogTrigger>
                  <DialogContent className="p-0 max-w-lg w-full max-h-[80vh] flex flex-col">
                    <AiChat selectedToken={selectedToken} inDialog walletInfo={walletInfo} />
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="h-full bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">AI Trading Assistant</h2>
                </div>
                <AiChat selectedToken={selectedToken} walletInfo={walletInfo} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-blue-200">
          <p className="text-sm">Built for educational purposes. Trade responsibly in real markets.</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-blue-300">
            <span>Market Data: Live</span>
            <span>•</span>
            <span>Latency: <span className="text-green-400">12ms</span></span>
            <span>•</span>
            <span>Status: <span className="text-green-400">Active</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TradingApp;
