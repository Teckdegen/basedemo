
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useBasePrice } from '@/hooks/useBasePrice';
import { useToast } from '@/hooks/use-toast';
import TokenChart from '@/components/TokenChart';
import TradeSummary from '@/components/TradeSummary';
import { useLocalWallet } from "@/hooks/useLocalWallet";

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
}

interface TradeSummaryData {
  tokenSymbol: string;
  tokenName: string;
  tradeType: 'buy' | 'sell';
  amount: number;
  pricePerToken: number;
  totalBase: number;
  basePrice: number;
  totalInvested?: number;
  totalReceived?: number;
  realizedPnL?: number;
  realizedPnLPercent?: number;
  remainingAmount?: number;
  avgBuyPrice?: number;
}

const TokenTradePage = () => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    baseBalance,
    holdings,
    trades,
    executeTrade,
    reset: resetLocalWallet,
  } = useLocalWallet();
  const { priceData: basePrice, forceRefresh: refreshBasePrice } = useBasePrice();
  const { toast } = useToast();
  
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [baseAmount, setBaseAmount] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [loading, setLoading] = useState(false);
  const [showTradeSummary, setShowTradeSummary] = useState(false);
  const [tradeSummaryData, setTradeSummaryData] = useState<TradeSummaryData | null>(null);

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

  // Calculate token amount when BASE amount changes (for buy)
  useEffect(() => {
    if (tradeType === 'buy' && baseAmount && tokenData) {
      const pricePerToken = tokenData.price / basePrice.usd;
      const calculatedTokens = parseFloat(baseAmount) / pricePerToken;
      setTokenAmount(calculatedTokens.toFixed(6));
    }
  }, [baseAmount, tradeType, tokenData, basePrice.usd]);

  // Calculate BASE amount when token amount changes (for sell)
  useEffect(() => {
    if (tradeType === 'sell' && tokenAmount && tokenData) {
      const pricePerToken = tokenData.price / basePrice.usd;
      const calculatedBase = parseFloat(tokenAmount) * pricePerToken;
      setBaseAmount(calculatedBase.toFixed(6));
    }
  }, [tokenAmount, tradeType, tokenData, basePrice.usd]);

  const profitLoss = currentHolding ? {
    unrealizedPnL: currentHolding.amount * (tokenData?.price || 0) / basePrice.usd - currentHolding.total_invested,
    unrealizedPnLPercent: currentHolding.total_invested > 0 ? 
      ((currentHolding.amount * (tokenData?.price || 0) / basePrice.usd - currentHolding.total_invested) / currentHolding.total_invested) * 100 : 0,
    currentValue: currentHolding.amount * (tokenData?.price || 0) / basePrice.usd
  } : null;

  const handleTradeTypeChange = (type: 'buy' | 'sell') => {
    setTradeType(type);
    setBaseAmount('');
    setTokenAmount('');
  };

  const handleTrade = async () => {
    if (!tokenData) {
      toast({
        title: "Error",
        description: "Token data not available",
        variant: "destructive"
      });
      return;
    }

    const tokensToTrade = parseFloat(tokenAmount);
    const baseToSpend = parseFloat(baseAmount);
    
    // Validation
    if (isNaN(tokensToTrade) || tokensToTrade <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid token amount",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(baseToSpend) || baseToSpend <= 0) {
      toast({
        title: "Invalid Amount", 
        description: "Please enter a valid BASE amount",
        variant: "destructive"
      });
      return;
    }

    const pricePerToken = tokenData.price / basePrice.usd;

    if (tradeType === 'buy') {
      if (baseToSpend > baseBalance) {
        toast({
          title: "Insufficient Balance",
          description: `You need ${baseToSpend.toFixed(4)} BASE but only have ${baseBalance.toFixed(4)} BASE`,
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!currentHolding || tokensToTrade > currentHolding.amount) {
        toast({
          title: "Insufficient Tokens",
          description: `You need ${tokensToTrade.toFixed(6)} ${tokenData.symbol} but only have ${currentHolding?.amount.toFixed(6) || 0} ${tokenData.symbol}`,
          variant: "destructive"
        });
        return;
      }
    }

    setLoading(true);
    console.log('Executing trade:', {
      type: tradeType,
      tokensToTrade,
      baseToSpend,
      pricePerToken,
      tokenAddress: tokenData.address
    });

    try {
      // Calculate P&L data for sells
      let pnlData = {};
      if (tradeType === 'sell' && currentHolding) {
        const proportionSold = tokensToTrade / currentHolding.amount;
        const investedInSoldTokens = currentHolding.total_invested * proportionSold;
        const realizedPnL = baseToSpend - investedInSoldTokens;
        const realizedPnLPercent = investedInSoldTokens > 0 ? (realizedPnL / investedInSoldTokens) * 100 : 0;
        const remainingAmount = currentHolding.amount - tokensToTrade;

        pnlData = {
          totalInvested: investedInSoldTokens,
          totalReceived: baseToSpend,
          realizedPnL,
          realizedPnLPercent,
          remainingAmount: remainingAmount > 0.000001 ? remainingAmount : 0,
          avgBuyPrice: currentHolding.average_buy_price
        };
      }

      // Execute the trade
      const result = executeTrade(
        tokenData.address,
        tokenData.symbol,
        tokenData.name,
        tradeType,
        tokensToTrade,
        pricePerToken,
        baseToSpend,
        basePrice.usd
      );

      console.log('Trade result:', result);

      if (result.error) {
        toast({
          title: "Trade Failed",
          description: result.error,
          variant: "destructive"
        });
      } else {
        // Success - show trade summary
        const summaryData: TradeSummaryData = {
          tokenSymbol: tokenData.symbol,
          tokenName: tokenData.name,
          tradeType,
          amount: tokensToTrade,
          pricePerToken,
          totalBase: baseToSpend,
          basePrice: basePrice.usd,
          ...pnlData
        };

        setTradeSummaryData(summaryData);
        setShowTradeSummary(true);
        setBaseAmount('');
        setTokenAmount('');

        toast({
          title: "Trade Successful!",
          description: `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${tokensToTrade.toFixed(6)} ${tokenData.symbol} for ${baseToSpend.toFixed(4)} BASE`,
        });
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during the trade",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseTradeSummary = () => {
    setShowTradeSummary(false);
    setTradeSummaryData(null);
  };

  const handleViewPnL = () => {
    setShowTradeSummary(false);
    navigate('/pnl');
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
                Balance: {baseBalance.toFixed(4)} BASE
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
                {/* Trade Type Selector */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    variant={tradeType === 'buy' ? 'default' : 'outline'}
                    onClick={() => handleTradeTypeChange('buy')}
                    className={tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    Buy
                  </Button>
                  <Button
                    variant={tradeType === 'sell' ? 'default' : 'outline'}
                    onClick={() => handleTradeTypeChange('sell')}
                    className={tradeType === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}
                    disabled={!currentHolding}
                  >
                    Sell
                  </Button>
                </div>

                {tradeType === 'buy' ? (
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">BASE to Spend</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={baseAmount}
                      onChange={(e) => setBaseAmount(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-500"
                    />
                    {baseAmount && tokenAmount && (
                      <div className="mt-2 text-sm text-gray-400">
                        You will receive: <span className="text-cyan-400 font-semibold">
                          {parseFloat(tokenAmount).toFixed(6)} {tokenData.symbol}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="text-sm text-gray-400 block mb-2">Tokens to Sell</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={tokenAmount}
                      onChange={(e) => setTokenAmount(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-500"
                      max={currentHolding?.amount || 0}
                    />
                    {currentHolding && (
                      <div className="mt-1 text-xs text-gray-500">
                        Available: {currentHolding.amount.toFixed(6)} {tokenData.symbol}
                      </div>
                    )}
                    {tokenAmount && baseAmount && (
                      <div className="mt-2 text-sm text-gray-400">
                        You will receive: <span className="text-cyan-400 font-semibold">
                          {parseFloat(baseAmount).toFixed(6)} BASE
                        </span>
                      </div>
                    )}
                  </div>
                )}
                
                <Button 
                  onClick={handleTrade}
                  className={`w-full ${
                    tradeType === 'buy' 
                      ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600'
                      : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600'
                  }`}
                  disabled={
                    loading || 
                    (tradeType === 'buy' && (!baseAmount || parseFloat(baseAmount) <= 0)) ||
                    (tradeType === 'sell' && (!tokenAmount || parseFloat(tokenAmount) <= 0))
                  }
                >
                  {loading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${tokenData.symbol}`}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <div>
            <TokenChart tokenData={tokenData} />
          </div>
        </div>
      </div>

      {/* Trade Summary Modal */}
      {showTradeSummary && tradeSummaryData && (
        <TradeSummary
          tradeData={tradeSummaryData}
          onClose={handleCloseTradeSummary}
          onViewPnL={handleViewPnL}
        />
      )}
    </div>
  );
};

export default TokenTradePage;
