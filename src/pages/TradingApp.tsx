
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TokenScanner from '@/components/TokenScanner';
import TrendingTokens from '@/components/TrendingTokens';
import { AiChat } from '@/components/AiChat';
import { Button } from '@/components/ui/button';
import { Wallet, User, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import UsernameOnboard from '@/components/UsernameOnboard';

const TradingApp = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { user, profile, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [showUsernameOnboard, setShowUsernameOnboard] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

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

  if (!isConnected || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (showUsernameOnboard) {
    return <UsernameOnboard onFinish={handleUsernameSet} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950">
      {/* Header */}
      <nav className="sticky top-0 z-50 w-full px-4 py-3 bg-black/60 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Base Trading</h1>
            <div className="hidden md:flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/wallet')}
                className="flex items-center gap-2 text-white hover:bg-white/10"
              >
                <Wallet className="w-4 h-4" />
                Wallet
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/pnl')}
                className="flex items-center gap-2 text-white hover:bg-white/10"
              >
                <TrendingUp className="w-4 h-4" />
                PNL
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {profile?.username && (
              <div className="flex items-center gap-2 px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-400/30">
                <User className="w-4 h-4 text-cyan-300" />
                <span className="text-cyan-200 text-sm font-medium">{profile.username}</span>
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
            <TokenScanner onTokenSelect={handleTokenSelect} />
            <TrendingTokens onTokenSelect={handleTokenSelect} />
          </div>
          
          {/* Right Column - AI Chat */}
          <div className={`${isMobile ? '' : 'lg:col-span-1'}`}>
            <AiChat selectedToken={selectedToken} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingApp;
