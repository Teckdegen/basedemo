
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const { isConnected } = useAccount();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Remove the automatic redirect that's causing the issue
  // Users will manually click to navigate

  const handleStartTrading = () => {
    console.log('Start Trading clicked, navigating to wallet');
    // Direct navigation without conditions
    navigate('/wallet');
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
    }}>
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {/* Base Demo Logo inspired design */}
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-indigo-600 font-black text-lg transform -rotate-12">BD</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full"></div>
            <div className="absolute top-2 -right-2 w-2 h-2 bg-white rounded-full"></div>
          </div>
          <span className="text-2xl font-bold text-white">Base Demo</span>
        </div>
        <div className="flex items-center space-x-4">
          <ConnectButton />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center animate-fade-in">
          <h1 className="text-6xl font-bold text-white mb-6">
            Demo Trade Any{' '}
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Base Token
            </span>
          </h1>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Practice trading with real-time data and virtual BASE tokens. Perfect your strategy 
            on Base chain tokens without any risk. Start with 1500 USDC to begin trading.
          </p>
          
          <div className="flex justify-center mb-12">
            <ConnectButton.Custom>
              {({ account, chain, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    {...(!ready && {
                      'aria-hidden': true,
                      style: {
                        opacity: 0,
                        pointerEvents: 'none',
                        userSelect: 'none',
                      },
                    })}
                  >
                    {!connected ? (
                      <Button
                        onClick={openConnectModal}
                        size="lg"
                        className="bg-white text-indigo-600 hover:bg-purple-50 px-8 py-4 text-lg font-bold transition-all shadow-xl hover:shadow-2xl rounded-2xl"
                      >
                        Connect Wallet to Start Trading
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStartTrading}
                        size="lg"
                        className="bg-white text-indigo-600 hover:bg-purple-50 px-8 py-4 text-lg font-bold transition-all shadow-xl hover:shadow-2xl rounded-2xl"
                      >
                        Start Trading
                      </Button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 animate-slide-up">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-indigo-900">Token Scanner</h3>
              <p className="text-indigo-700">
                Validate any Base token with real-time data from Dexscreener and BaseScan
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-indigo-900">Live Charts & P&L</h3>
              <p className="text-indigo-700">
                View real-time price charts and track your profit/loss on each position
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white/90 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-indigo-900">Risk-Free Trading</h3>
              <p className="text-indigo-700">
                Start with 1500 USDC and track your performance with persistent data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-20 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-white mb-2">1500 USDC</div>
              <div className="text-purple-200">Starting Balance</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">Real-Time</div>
              <div className="text-purple-200">Market Data</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">Base Chain</div>
              <div className="text-purple-200">Network Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-purple-200">
          <p>Built for educational purposes. Trade responsibly in real markets.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
