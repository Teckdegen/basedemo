
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

  React.useEffect(() => {
    if (isConnected && user) {
      navigate('/app');
    }
  }, [isConnected, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BD</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Base Demo</span>
        </div>
        <div className="flex items-center space-x-4">
          <ConnectButton />
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center animate-fade-in">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Demo Trade Any{' '}
            <span className="bg-gradient-to-r from-primary-800 to-primary-500 bg-clip-text text-transparent">
              Base Token
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Practice trading with real-time data and virtual BASE tokens. Perfect your strategy 
            on Base chain tokens without any risk. Start with 1 BASE token (pegged to real price).
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
                        className="gradient-bg text-white px-8 py-4 text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                      >
                        Connect Wallet to Start
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate('/app')}
                        size="lg"
                        className="gradient-bg text-white px-8 py-4 text-lg font-semibold hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                        disabled={!user}
                      >
                        {user ? 'Go to Trading App' : 'Loading...'}
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
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Token Scanner</h3>
              <p className="text-gray-600">
                Validate any Base token with real-time data from Dexscreener and BaseScan
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Live Charts & P&L</h3>
              <p className="text-gray-600">
                View real-time price charts and track your profit/loss on each position
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Risk-Free Trading</h3>
              <p className="text-gray-600">
                Start with 1 BASE token (real price) and track your performance with persistent data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-20 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary-800 mb-2">1 BASE</div>
              <div className="text-gray-600">Starting Balance</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-800 mb-2">Real-Time</div>
              <div className="text-gray-600">Market Data</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-800 mb-2">Base Chain</div>
              <div className="text-gray-600">Network Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-600">
          <p>Built for educational purposes. Trade responsibly in real markets.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
