
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
  const { profile: supabaseProfile, holdings } = useSupabaseData();
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

  // Create wallet info for AI
  const walletInfo = supabaseProfile && holdings ? {
    balance: supabaseProfile.base_balance,
    portfolio: Object.fromEntries(holdings.map(h => [h.token_address, h.amount])),
    tokenDetails: Object.fromEntries(holdings.map(h => [h.token_address, {
      address: h.token_address,
      name: h.token_name,
      symbol: h.token_symbol,
      price: h.average_buy_price,
      priceChange24h: 0
    }]))
  } : null;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      {/* Header */}
      <nav className="border-b border-white/10 backdrop-blur-md bg-white/5">
        <div className="flex justify-between items-center p-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            {/* Mobile hamburger menu */}
            {isMobile && <MobileNav />}
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-white to-blue-100 rounded-2xl flex items-center justify-center shadow-2xl border border-white/20">
                  <span className="text-blue-700 font-black text-xl">BD</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
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
                  className="flex items-center gap-2 text-white hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-200 rounded-xl px-4 py-2 font-medium"
                >
                  <Wallet className="w-4 h-4" />
                  Portfolio
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePnLClick}
                  className="flex items-center gap-2 text-white hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-200 rounded-xl px-4 py-2 font-medium"
                >
                  <BarChart3 className="w-4 h-4" />
                  P&L
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTasksClick}
                  className="flex items-center gap-2 text-white hover:bg-white/20 border border-white/20 hover:border-white/40 transition-all duration-200 rounded-xl px-4 py-2 font-medium"
                >
                  <Activity className="w-4 h-4" />
                  Tasks
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {profile?.username && (
              <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm">
                <User className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">{profile.username}</span>
              </div>
            )}
            {supabaseProfile && (
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-white/20 backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">{supabaseProfile.base_balance.toFixed(2)} USDC</span>
              </div>
            )}
            <div className="bg-white/10 rounded-xl border border-white/20 backdrop-blur-sm overflow-hidden">
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-200 text-sm">Total Balance</div>
                <div className="text-white text-xl font-bold">${supabaseProfile?.base_balance.toFixed(2) || '0.00'}</div>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-blue-300" />
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-200 text-sm">Active Positions</div>
                <div className="text-white text-xl font-bold">{holdings?.length || 0}</div>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-300" />
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-200 text-sm">Today's P&L</div>
                <div className="text-green-400 text-xl font-bold">+$0.00</div>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-300" />
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-200 text-sm">Market Status</div>
                <div className="text-green-400 text-xl font-bold">Live</div>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-yellow-300" />
              </div>
            </div>
          </div>
        </div>

        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* Left Column - Token Scanner and Trending */}
          <div className={`space-y-8 ${isMobile ? '' : 'lg:col-span-2'}`}>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🔍</span>
                </div>
                <h2 className="text-xl font-bold text-white">Token Scanner</h2>
              </div>
              <TokenScanner onTokenSelect={handleTokenSelect} />
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Trending Tokens</h2>
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
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 py-4 px-6 rounded-2xl font-semibold mb-4 flex items-center justify-center gap-3 transition-all duration-200 shadow-xl border border-white/20"
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
              <div className="h-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">AI Trading Assistant</h2>
                </div>
                <AiChat selectedToken={selectedToken} walletInfo={walletInfo} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-20 py-8 bg-white/5 backdrop-blur-sm">
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
