
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useBasePrice } from '@/hooks/useBasePrice';
import { useToast } from '@/hooks/use-toast';
import TokenChart from '@/components/TokenChart';

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
}

const TokenTradePage = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, holdings, executeTrade, loading: dataLoading } = useSupabaseData();
  const { priceData: basePrice, forceRefresh: refreshBasePrice } = useBasePrice();
  const { toast } = useToast();
  
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const currentHolding = holdings.find(h => h.token_address === tokenAddress);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Load token data from localStorage or fetch from API
    const savedTokens = localStorage.getItem('scannedTokens');
    if (savedTokens && tokenAddress) {
      const tokens = JSON.parse(savedTokens);
      const token = tokens[tokenAddress];
      if (token) {
        setTokenData(token);
      }
    }
  }, [user, tokenAddress, navigate]);

  const profitLoss = currentHolding ? {
    unrealizedPnL: currentHolding.amount * (tokenData?.price || 0) / basePrice.usd - currentHolding.total_invested,
    unrealizedPnLPercent: currentHolding.total_invested > 0 ? 
      ((currentHolding.amount * (tokenData?.price || 0) / basePrice.usd - currentHolding.total_invested) / currentHolding.total_invested) * 100 : 0,
    currentValue: currentHolding.amount * (tokenData?.price || 0) / basePrice.usd
  } : null;

  const handleTrade = async (type: 'buy' | 'sell') => {
    if (!tokenData || !profile || !tradeAmount) return;

    const amount = parseFloat(tradeAmount);
    const pricePerToken = tokenData.price / basePrice.usd;
    const totalBase = amount * pricePerToken;

    if (type === 'buy' && totalBase > profile.base_balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough BASE for this trade",
        variant: "destructive"
      });
      return;
    }

    if (type === 'sell' && (!currentHolding || amount > currentHolding.amount)) {
      toast({
        title: "Insufficient Tokens",
        description: "You don't have enough tokens to sell",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await executeTrade(
        tokenData.address,
        tokenData.symbol,
        tokenData.name,
        type,
        amount,
        pricePerToken,
        totalBase,
        basePrice.usd,
        async () => {
          // Refresh prices after trade
          await refreshBasePrice();
        }
      );

      if (error) {
        toast({
          title: "Trade Failed",
          description: "Failed to execute trade. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Trade Executed",
          description: `${type === 'buy' ? 'Bought' : 'Sold'} ${amount} ${tokenData.symbol}`,
        });
        setTradeAmount('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-black/40 backdrop-blur-md border-white/20 text-white">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Token Not Found</h2>
            <p className="text-gray-400 mb-4">The requested token data could not be loaded.</p>
            <Button onClick={() => navigate('/app')} variant="outline">
              Back to Trading
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app')}
                className="flex items-center space-x-2 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Trading</span>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">BD</span>
                </div>
                <span className="text-xl font-bold text-white">{tokenData.symbol} Trading</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-cyan-400 text-sm font-medium">
                Balance: {profile?.base_balance.toFixed(4) || '0.0000'} BASE
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Trading Panel */}
          <div className="space-y-6">
            {/* Token Info */}
            <Card className="bg-black/40 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{tokenData.name} ({tokenData.symbol})</span>
                  <span className={`text-sm font-semibold ${
                    tokenData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tokenData.priceChange24h >= 0 ? '+' : ''}{tokenData.priceChange24h.toFixed(2)}%
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-400 mb-2">
                  ${tokenData.price.toFixed(6)}
                </div>
                <div className="text-sm text-gray-400">
                  {(tokenData.price / basePrice.usd).toFixed(8)} BASE
                </div>
              </CardContent>
            </Card>

            {/* Holdings & P&L */}
            {currentHolding && profitLoss && (
              <Card className="bg-black/40 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Your Position</span>
                    {profitLoss.unrealizedPnL >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Holdings</div>
                      <div className="text-lg font-semibold">
                        {currentHolding.amount.toFixed(6)} {tokenData.symbol}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Avg Buy Price</div>
                      <div className="text-lg font-semibold">
                        {currentHolding.average_buy_price.toFixed(8)} BASE
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-400">Total Invested</div>
                      <div className="text-lg font-semibold">
                        {currentHolding.total_invested.toFixed(4)} BASE
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Current Value</div>
                      <div className="text-lg font-semibold">
                        {profitLoss.currentValue.toFixed(4)} BASE
                      </div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg ${
                    profitLoss.unrealizedPnL >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    <div className="text-sm text-gray-300">Unrealized P&L</div>
                    <div className={`text-xl font-bold ${
                      profitLoss.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {profitLoss.unrealizedPnL >= 0 ? '+' : ''}{profitLoss.unrealizedPnL.toFixed(4)} BASE
                    </div>
                    <div className={`text-sm ${
                      profitLoss.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ({profitLoss.unrealizedPnLPercent >= 0 ? '+' : ''}{profitLoss.unrealizedPnLPercent.toFixed(2)}%)
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trading Form */}
            <Card className="bg-black/40 backdrop-blur-md border-white/20 text-white">
              <CardHeader>
                <CardTitle>Trade {tokenData.symbol}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Amount</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={tradeAmount}
                    onChange={(e) => setTradeAmount(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-500"
                  />
                </div>
                
                {tradeAmount && (
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <div className="text-sm text-gray-300">
                      Total: <span className="text-cyan-400 font-semibold">
                        {((parseFloat(tradeAmount) * tokenData.price) / basePrice.usd).toFixed(6)} BASE
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => handleTrade('buy')}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                    disabled={!tradeAmount || parseFloat(tradeAmount) <= 0 || loading || dataLoading}
                  >
                    {loading ? 'Processing...' : 'Buy'}
                  </Button>
                  <Button 
                    onClick={() => handleTrade('sell')}
                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600"
                    disabled={!tradeAmount || parseFloat(tradeAmount) <= 0 || !currentHolding || loading || dataLoading}
                  >
                    {loading ? 'Processing...' : 'Sell'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <div>
            <TokenChart tokenData={tokenData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenTradePage;
