
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Index = () => {
  const { isConnected } = useAccount();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleStartTrading = () => {
    console.log('Start Trading clicked, navigating to trade page');
    navigate('/trades');
  };

  // Show loading while auth is being processed
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#6366f1' }}>
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: '#6366f1',
    }}>
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
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
        <div className="flex items-center space-x-4">
          <ConnectButton />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center animate-fade-in">
          <h1 className="text-6xl font-bold text-white mb-6">
            Demo Trade Any{' '}
            <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Base Token
            </span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Practice trading with real-time data and virtual BASE tokens. Perfect your strategy 
            on Base chain tokens without any risk. Start with 1500 USDC to begin trading.
          </p>
          
          <div className="flex justify-center mb-12">
            {isConnected && user ? (
              <Button
                onClick={handleStartTrading}
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-bold transition-all shadow-xl hover:shadow-2xl rounded-2xl"
              >
                Start Trading
              </Button>
            ) : (
              <div className="text-center">
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
                        <Button
                          onClick={openConnectModal}
                          size="lg"
                          className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-bold transition-all shadow-xl hover:shadow-2xl rounded-2xl"
                        >
                          {connected ? 'Authenticating...' : 'Connect Wallet to Start Trading'}
                        </Button>
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
                {isConnected && !user && (
                  <p className="text-blue-200 mt-4">Authenticating your wallet...</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 animate-slide-up">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-900">Token Scanner</h3>
              <p className="text-blue-700">
                Validate any Base token with real-time data from Dexscreener and BaseScan
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-900">Live Charts & P&L</h3>
              <p className="text-blue-700">
                View real-time price charts and track your profit/loss on each position
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white rounded-2xl">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-blue-900">Risk-Free Trading</h3>
              <p className="text-blue-700">
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
              <div className="text-blue-200">Starting Balance</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">Real-Time</div>
              <div className="text-blue-200">Market Data</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">Base Chain</div>
              <div className="text-blue-200">Network Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-blue-200">
          <p>Built for educational purposes. Trade responsibly in real markets.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
