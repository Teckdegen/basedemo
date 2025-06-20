
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TokenScanner from '@/components/TokenScanner';
import TrendingTokens from '@/components/TrendingTokens';
import { AiChat } from '@/components/AiChat';
import { Button } from '@/components/ui/button';
import { Wallet, User, TrendingUp, MessageCircle, Bot } from 'lucide-react';
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
  const { profile: supabaseProfile } = useSupabaseData();
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
    console.log('Wallet button clicked, navigating to /portfolio');
    navigate('/portfolio');
  };

  const handlePnLClick = () => {
    console.log('PNL button clicked, navigating to /pnl');
    navigate('/pnl');
  };

  const handleTasksClick = () => {
    console.log('Tasks button clicked, navigating to /bounties');
    navigate('/bounties');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#6366f1' }}>
        <div className="flex items-center justify-center min-h-screen text-white text-xl">
          Loading...
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
      <nav className="sticky top-0 z-50 w-full px-4 py-3 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile hamburger menu */}
            {isMobile && <MobileNav />}
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-blue-600 font-black text-lg">BD</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
                <div className="absolute top-2 -right-2 w-2 h-2 bg-white rounded-full"></div>
              </div>
              <span className="text-2xl font-bold text-white">Base Demo</span>
            </div>
            
            {/* Desktop navigation */}
            {!isMobile && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWalletClick}
                  className="flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <Wallet className="w-4 h-4" />
                  Portfolio
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePnLClick}
                  className="flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <TrendingUp className="w-4 h-4" />
                  PNL
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTasksClick}
                  className="flex items-center gap-2 text-white hover:bg-white/10"
                >
                  <TrendingUp className="w-4 h-4" />
                  Tasks
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {profile?.username && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full border border-white/30">
                <User className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">{profile.username}</span>
              </div>
            )}
            {supabaseProfile && (
              <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full border border-white/30">
                <Wallet className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">{supabaseProfile.base_balance.toFixed(2)} USDC</span>
              </div>
            )}
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className={`grid gap-8 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* Left Column - Token Scanner and Trending */}
          <div className={`space-y-8 ${isMobile ? '' : 'lg:col-span-2'}`}>
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <TokenScanner onTokenSelect={handleTokenSelect} />
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6">
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
                      className="w-full bg-white text-blue-600 hover:bg-blue-50 py-3 px-4 rounded-2xl font-semibold mb-4 flex items-center justify-center gap-2 transition-all shadow-xl"
                    >
                      <Bot className="w-5 h-5" />
                      Open AI Chat
                    </button>
                  </DialogTrigger>
                  <DialogContent className="p-0 max-w-lg w-full max-h-[80vh] flex flex-col">
                    <AiChat selectedToken={selectedToken} inDialog />
                  </DialogContent>
                </Dialog>
              </>
            ) : (
              <div className="h-full bg-white rounded-2xl shadow-xl p-6">
                <AiChat selectedToken={selectedToken} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingApp;
