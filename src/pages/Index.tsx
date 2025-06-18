
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
      navigate('/trade');
    }
  }, [isConnected, user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BD</span>
          </div>
          <span className="text-xl font-bold text-white">Base Demo</span>
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
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Base Token
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
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
                        className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                      >
                        Connect Wallet to Start Trading
                      </Button>
                    ) : (
                      <Button
                        onClick={() => navigate('/trade')}
                        size="lg"
                        className="bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white px-8 py-4 text-lg font-semibold transition-all shadow-lg hover:shadow-xl"
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
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Token Scanner</h3>
              <p className="text-slate-300">
                Validate any Base token with real-time data from Dexscreener and BaseScan
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Live Charts & P&L</h3>
              <p className="text-slate-300">
                View real-time price charts and track your profit/loss on each position
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Risk-Free Trading</h3>
              <p className="text-slate-300">
                Start with 1500 USDC and track your performance with persistent data
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-20 text-center">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">1500 USDC</div>
              <div className="text-slate-300">Starting Balance</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">Real-Time</div>
              <div className="text-slate-300">Market Data</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-cyan-400 mb-2">Base Chain</div>
              <div className="text-slate-300">Network Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400">
          <p>Built for educational purposes. Trade responsibly in real markets.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
