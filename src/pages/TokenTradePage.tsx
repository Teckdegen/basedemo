
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useLocalWallet } from '@/hooks/useLocalWallet';
import { useBasePrice } from '@/hooks/useBasePrice';
import TokenChart from '@/components/TokenChart';

const TokenTradePage = () => {
  const { tokenAddress } = useParams();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { user, profile } = useAuth();
  const { priceData: basePrice } = useBasePrice();
  const { baseBalance, executeTrade, holdings } = useLocalWallet();
  
  const [token, setToken] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  // Get current holding for this token
  const currentHolding = holdings.find(h => h.token_address === tokenAddress);

  useEffect(() => {
    // Get token data from localStorage
    const savedTokens = localStorage.getItem('scannedTokens');
    if (savedTokens && tokenAddress) {
      const tokens = JSON.parse(savedTokens);
      const tokenData = tokens[tokenAddress];
      if (tokenData) {
        setToken({
          ...tokenData,
          priceInBase: tokenData.price / basePrice.usd,
          change24h: Math.random() * 10 - 5 // Mock change for demo
        });
      }
    }
  }, [tokenAddress, basePrice.usd]);

  const handleTrade = async () => {
    if (!token || !amount || !profile) return;

    const tradeAmount = parseFloat(amount);
    const totalCost = tradeAmount * token.priceInBase;

    if (tradeType === 'buy') {
      if (totalCost > baseBalance) {
        alert('Insufficient USDC balance');
        return;
      }
    } else {
      if (!currentHolding || tradeAmount > currentHolding.amount) {
        alert('Insufficient token balance');
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = await executeTrade(
        tokenAddress!,
        token.symbol,
        token.name,
        tradeType,
        tradeAmount,
        token.priceInBase,
        totalCost,
        basePrice.usd
      );

      if (result.error) {
        alert(result.error);
      } else {
        alert(`${tradeType === 'buy' ? 'Bought' : 'Sold'} ${tradeAmount} ${token.symbol}!`);
        setAmount('');
      }
    } catch (error) {
      console.error('Trade error:', error);
      alert('Trade failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen" style={{ background: '#6366f1' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading token data...</div>
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
            <span className="text-2xl font-bold text-white">{token.symbol} Trading</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full border border-white/30">
            <span className="text-white text-sm font-medium">Balance: {baseBalance.toFixed(2)} USDC</span>
          </div>
          <ConnectButton />
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Token Info & Chart */}
          <div className="space-y-6">
            {/* Token Price Card */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {token.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-blue-900">{token.name}</CardTitle>
                      <p className="text-blue-600 font-medium">{token.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-900">
                      ${token.priceInBase.toFixed(8)}
                    </div>
                    <div className="text-blue-600 text-sm">
                      {(token.priceInBase * basePrice.usd).toFixed(8)} BASE
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {token.change24h >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`font-semibold ${token.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}% (24h)
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-blue-900">Price Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <TokenChart tokenData={token} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Trading Interface */}
          <div className="space-y-6">
            {/* Your Position */}
            {currentHolding && (
              <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Your Position
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-blue-600">Holdings</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {currentHolding.amount.toFixed(6)} {token.symbol}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">Avg Buy Price</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {currentHolding.average_buy_price.toFixed(8)} BASE
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">Total Invested</div>
                      <div className="text-lg font-semibold text-blue-900">
                        {currentHolding.total_invested.toFixed(4)} BASE
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-blue-600">Current Value</div>
                      <div className="text-lg font-semibold text-blue-900">
                        {(currentHolding.amount * token.priceInBase).toFixed(4)} BASE
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-600">Unrealized P&L</div>
                    <div className={`text-xl font-bold ${
                      (currentHolding.amount * token.priceInBase) - currentHolding.total_invested >= 0 
                        ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {((currentHolding.amount * token.priceInBase) - currentHolding.total_invested >= 0 ? '+' : '')}
                      {((currentHolding.amount * token.priceInBase) - currentHolding.total_invested).toFixed(4)} BASE
                      {' '}
                      ({(((currentHolding.amount * token.priceInBase) / currentHolding.total_invested - 1) * 100).toFixed(2)}%)
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trade Interface */}
            <Card className="border-0 shadow-xl hover:shadow-2xl transition-all bg-white rounded-2xl">
              <CardHeader>
                <CardTitle className="text-blue-900">Trade {token.symbol}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Buy/Sell Toggle */}
                <div className="flex bg-blue-100 rounded-lg p-1">
                  <button
                    onClick={() => setTradeType('buy')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                      tradeType === 'buy'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setTradeType('sell')}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                      tradeType === 'sell'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-700">
                    Amount ({token.symbol})
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Enter ${token.symbol} amount`}
                    className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Trade Summary */}
                {amount && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Amount:</span>
                      <span className="font-semibold text-blue-900">{amount} {token.symbol}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600">Price per token:</span>
                      <span className="font-semibold text-blue-900">{token.priceInBase.toFixed(8)} BASE</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-blue-200 pt-2">
                      <span className="text-blue-600">Total:</span>
                      <span className="font-bold text-blue-900">
                        {(parseFloat(amount || '0') * token.priceInBase).toFixed(6)} BASE
                      </span>
                    </div>
                  </div>
                )}

                {/* Trade Button */}
                <Button
                  onClick={handleTrade}
                  disabled={!amount || isLoading || !isConnected}
                  className={`w-full py-6 text-lg font-semibold rounded-lg transition-all ${
                    tradeType === 'buy'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${token.symbol}`
                  )}
                </Button>

                {/* Balance Info */}
                <div className="text-center text-sm text-blue-600">
                  Available: {tradeType === 'buy' 
                    ? `${baseBalance.toFixed(2)} USDC` 
                    : `${currentHolding?.amount.toFixed(6) || '0'} ${token.symbol}`
                  }
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/demowallet')}
                variant="outline"
                className="flex-1 border-white/30 text-white hover:bg-white/10 font-medium py-3 rounded-2xl border-2"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                View Portfolio
              </Button>
              <Button 
                onClick={() => navigate('/pnl')}
                variant="outline"
                className="flex-1 border-white/30 text-white hover:bg-white/10 font-medium py-3 rounded-2xl border-2"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                P&L Report
              </Button>
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

export default TokenTradePage;
