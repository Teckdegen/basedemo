
import React from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Wallet, TrendingUp, DollarSign, Activity, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useIsMobile } from '@/hooks/use-mobile';

const PortfolioPage = () => {
  const { profile, holdings, trades, loading } = useSupabaseData();
  const { user, loading: authLoading } = useAuth();
  const { isConnected } = useAccount();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Show loading while checking authentication
  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl font-semibold">Loading portfolio...</div>
        </div>
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!isConnected || !user) {
    navigate('/');
    return null;
  }

  // Calculate portfolio statistics
  const totalBalance = profile?.base_balance || 0;
  const totalHoldings = holdings.reduce((sum, holding) => sum + holding.amount, 0);
  const totalTrades = trades.length;
  const todaysPnL = 0; // Placeholder for now

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800">
      {/* Header */}
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
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-2xl font-bold text-white">My Portfolio</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Balance */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalBalance.toFixed(2)}</div>
              <p className="text-xs text-white/60 mt-1">USDC Balance</p>
            </CardContent>
          </Card>

          {/* Holdings Count */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Active Holdings</CardTitle>
              <Wallet className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{holdings.length}</div>
              <p className="text-xs text-white/60 mt-1">Token positions</p>
            </CardContent>
          </Card>

          {/* Total Trades */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Trades</CardTitle>
              <Activity className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrades}</div>
              <p className="text-xs text-white/60 mt-1">All time trades</p>
            </CardContent>
          </Card>

          {/* Today's P&L */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Today's P&L</CardTitle>
              <BarChart3 className="h-4 w-4 text-white/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+$0.00</div>
              <p className="text-xs text-green-400 mt-1">+0.00%</p>
            </CardContent>
          </Card>
        </div>

        {/* Holdings Section */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Token Holdings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {holdings.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No Holdings Yet</h3>
                <p className="text-white/60 mb-4">Start trading to build your portfolio</p>
                <Button 
                  onClick={() => navigate('/trade')}
                  className="bg-white text-blue-600 hover:bg-white/90"
                >
                  Start Trading
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {holdings.map((holding) => (
                  <div
                    key={holding.id}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => navigate(`/trade/${holding.token_address}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {holding.token_symbol?.slice(0, 2) || "?"}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-white">{holding.token_name}</div>
                          <div className="text-sm text-white/60">{holding.token_symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          {holding.amount.toFixed(6)}
                        </div>
                        <div className="text-sm text-white/60">
                          Avg: ${holding.average_buy_price.toFixed(6)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Trades Section */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trades.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-white/40 mx-auto mb-3" />
                <p className="text-white/60">No trades yet. Start with 1500 USDC!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {trades.slice(0, 10).map((trade) => (
                  <div key={trade.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          trade.trade_type === 'buy' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {trade.trade_type.toUpperCase()}
                        </span>
                        <div>
                          <div className="text-white font-medium">{trade.token_symbol}</div>
                          <div className="text-white/60 text-xs">
                            {new Date(trade.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {trade.amount.toFixed(4)} {trade.token_symbol}
                        </div>
                        <div className="text-white/60 text-xs">
                          ${trade.total_base.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={() => navigate('/trade')}
            className="bg-white text-blue-600 hover:bg-white/90 font-medium px-8"
          >
            Continue Trading
          </Button>
          <Button 
            onClick={() => navigate('/pnl')}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10 font-medium px-8"
          >
            View P&L Report
          </Button>
        </div>
      </main>
    </div>
  );
};

export default PortfolioPage;
