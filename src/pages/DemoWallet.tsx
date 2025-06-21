
import React from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Wallet, TrendingUp, DollarSign, Activity, BarChart3, Eye, TrendingDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useIsMobile } from '@/hooks/use-mobile';

const DemoWallet = () => {
  const { profile, holdings, trades, loading } = useSupabaseData();
  const { user, loading: authLoading } = useAuth();
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Demo data for showcase
  const demoHoldings = [
    { symbol: 'ETH', name: 'Ethereum', amount: 2.45, value: 6125.50, change: +5.2 },
    { symbol: 'BTC', name: 'Bitcoin', amount: 0.15, value: 4875.00, change: +2.1 },
    { symbol: 'USDC', name: 'USD Coin', amount: 1500.00, value: 1500.00, change: 0.0 },
    { symbol: 'SOL', name: 'Solana', amount: 45.2, value: 2850.60, change: -1.8 },
  ];

  const totalPortfolioValue = demoHoldings.reduce((sum, holding) => sum + holding.value, 0);
  const totalChange = +245.80;
  const totalChangePercent = +1.67;

  // Show loading while checking authentication
  if (loading || authLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#6366f1' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl font-semibold">Loading demo wallet...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#6366f1' }}>
      {/* Header */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
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
            <span className="text-2xl font-bold text-white">Demo Wallet</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Portfolio Overview */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
                <p className="text-blue-100">Demo trading account</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                ${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="text-blue-100">Total Value</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${totalChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {totalChange >= 0 ? '+' : ''}${totalChange.toFixed(2)}
              </div>
              <div className="text-blue-100">24h Change</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${totalChangePercent >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {totalChangePercent >= 0 ? '+' : ''}{totalChangePercent.toFixed(2)}%
              </div>
              <div className="text-blue-100">24h Change %</div>
            </div>
          </div>
        </div>

        {/* Portfolio Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Total Assets</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{demoHoldings.length}</div>
              <p className="text-xs text-blue-600 mt-1">Different tokens</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Best Performer</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">ETH</div>
              <p className="text-xs text-green-600 mt-1">+5.2% today</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Worst Performer</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">SOL</div>
              <p className="text-xs text-red-600 mt-1">-1.8% today</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Allocation</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">4</div>
              <p className="text-xs text-blue-600 mt-1">Diversified</p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Section */}
        <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white rounded-2xl">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Token Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoHoldings.map((holding, index) => (
                <div
                  key={index}
                  className="bg-blue-50 rounded-xl p-4 border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer"
                  onClick={() => navigate('/trade')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {holding.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-blue-900 text-lg">{holding.name}</div>
                        <div className="text-blue-600">{holding.symbol}</div>
                        <div className="text-sm text-blue-500">
                          {holding.amount} {holding.symbol}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-900 text-lg">
                        ${holding.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <div className={`text-sm font-medium ${
                        holding.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {holding.change >= 0 ? '+' : ''}{holding.change.toFixed(1)}%
                      </div>
                      <div className="text-xs text-blue-600">
                        24h change
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button 
            onClick={() => navigate('/trade')}
            className="bg-white text-blue-600 hover:bg-blue-50 font-medium px-8 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
          >
            <Activity className="w-4 h-4 mr-2" />
            Start Trading
          </Button>
          <Button 
            onClick={() => navigate('/portfolio')}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 font-medium px-8 py-3 rounded-2xl border-2"
          >
            <Wallet className="w-4 h-4 mr-2" />
            View Real Portfolio
          </Button>
          <Button 
            onClick={() => navigate('/pnl')}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 font-medium px-8 py-3 rounded-2xl border-2"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View P&L Report
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-blue-200">
          <p>Built for educational purposes. Trade responsibly in real markets.</p>
        </div>
      </footer>
    </div>
  );
};

export default DemoWallet;
