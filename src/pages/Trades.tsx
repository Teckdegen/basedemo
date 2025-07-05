import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, TrendingUp, TrendingDown, Activity, DollarSign, User, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { useBasePrice } from '@/hooks/useBasePrice';
import { searchTokenByAddress } from '@/services/dexScreenerService';
import { useToast } from '@/hooks/use-toast';

const TradesPage = () => {
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const { priceData: basePrice } = useBasePrice();
  const { profile, holdings, executeTrade, refreshData, loading } = useSupabaseData();
  const { toast } = useToast();
  
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tokenSearch, setTokenSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get available balance from profile
  const availableBalance = profile?.base_balance || 0;

  console.log('Trades page data:', {
    isConnected,
    user: !!user,
    profile,
    holdings: holdings.length,
    availableBalance,
    loading,
    authLoading
  });

  // Convert holdings to displayable tokens with current prices
  const portfolioTokens = holdings.map(holding => ({
    address: holding.token_address,
    symbol: holding.token_symbol,
    name: holding.token_name,
    price: holding.average_buy_price * basePrice.usd,
    holding: holding.amount,
    totalValue: holding.total_invested * basePrice.usd,
    priceChange24h: 0
  }));

  // Handle token search
  const handleSearch = async () => {
    if (!tokenSearch.trim()) {
      setSearchResults([]);
      return;
    }

    if (tokenSearch.startsWith('0x') && tokenSearch.length === 42) {
      setIsSearching(true);
      try {
        const tokenData = await searchTokenByAddress(tokenSearch.trim());
        if (tokenData) {
          setSearchResults([{
            address: tokenData.address,
            symbol: tokenData.symbol,
            name: tokenData.name,
            price: tokenData.price,
            priceChange24h: tokenData.priceChange24h,
            marketCap: tokenData.marketCap,
            dex: tokenData.dex
          }]);
        } else {
          setSearchResults([]);
          toast({
            title: "Token not found",
            description: "Could not find token data for this address",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error searching token:', error);
        setSearchResults([]);
        toast({
          title: "Search failed",
          description: "Failed to search for token",
          variant: "destructive"
        });
      } finally {
        setIsSearching(false);
      }
    } else {
      const filtered = portfolioTokens.filter(token => 
        token.symbol.toLowerCase().includes(tokenSearch.toLowerCase()) ||
        token.name.toLowerCase().includes(tokenSearch.toLowerCase())
      );
      setSearchResults(filtered);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [tokenSearch]);

  const tokensToDisplay = tokenSearch ? searchResults : portfolioTokens;

  const handleTrade = async () => {
    if (!selectedToken || !amount || !profile) {
      console.log('Missing required data for trade:', { token: !!selectedToken, amount, profile: !!profile });
      return;
    }

    const tradeAmount = parseFloat(amount);
    if (isNaN(tradeAmount) || tradeAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    const priceInBase = selectedToken.price / basePrice.usd;
    const totalCost = tradeAmount * priceInBase;
    const currentHolding = holdings.find(h => h.token_address === selectedToken.address);

    console.log('Trade attempt:', {
      tradeType,
      tradeAmount,
      pricePerToken: priceInBase,
      totalCost,
      currentBalance: availableBalance,
      currentHolding: currentHolding?.amount || 0
    });

    if (tradeType === 'buy') {
      if (totalCost > availableBalance) {
        toast({
          title: "Insufficient balance",
          description: `You need ${totalCost.toFixed(4)} BASE but only have ${availableBalance.toFixed(4)} BASE`,
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!currentHolding || tradeAmount > currentHolding.amount) {
        toast({
          title: "Insufficient tokens",
          description: `You need ${tradeAmount} ${selectedToken.symbol} but only have ${currentHolding?.amount || 0}`,
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      console.log('Executing trade via Supabase...');
      const result = await executeTrade(
        selectedToken.address,
        selectedToken.symbol,
        selectedToken.name,
        tradeType,
        tradeAmount,
        priceInBase,
        totalCost,
        basePrice.usd
      );

      if (result.error) {
        console.error('Trade execution error:', result.error);
        toast({
          title: "Trade failed",
          description: result.error,
          variant: "destructive"
        });
      } else {
        console.log('Trade successful:', result.data);
        toast({
          title: "Trade successful",
          description: `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${tradeAmount} ${selectedToken.symbol} successfully!`
        });
        setAmount('');
        setSelectedToken(null);
      }
    } catch (error) {
      console.error('Trade error:', error);
      toast({
        title: "Trade failed",
        description: "Trade failed due to an unexpected error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (loading || authLoading) {
    return (
      <div className="min-h-screen" style={{ background: '#6366f1' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">
            {authLoading ? 'Setting up your account...' : 'Loading your portfolio...'}
          </div>
        </div>
      </div>
    );
  }

  // Show message if not connected or no user
  if (!isConnected || !user || !profile) {
    return (
      <div className="min-h-screen" style={{ background: '#6366f1' }}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
            <p className="mb-6">Please connect your wallet to access trading</p>
            <ConnectButton />
            {isConnected && !profile && (
              <p className="mt-4 text-blue-200">Setting up your trading account...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#6366f1' }}>
      {/* Header */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/trade')}
            className="flex items-center gap-2 text-white hover:bg-white/10 rounded-xl px-4 py-2 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden md:inline-block">Back to Trading</span>
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-blue-600 font-black text-lg">BD</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
              <div className="absolute top-2 -right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">Token Trades</span>
              <div className="text-blue-200 text-sm font-medium">Select & Trade Tokens</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {authProfile?.username && (
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl backdrop-blur-sm">
              <User className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-medium">{authProfile.username}</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">{availableBalance.toFixed(2)} BASE</span>
          </div>
          <div className="bg-white/10 rounded-xl backdrop-blur-sm overflow-hidden">
            <ConnectButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left Column - Token Selection */}
          <Card className="bg-white/95 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-gray-800 flex items-center gap-2">
                <Search className="w-5 h-5" />
                Select Token to Trade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search portfolio tokens or paste contract address (0x...)"
                  value={tokenSearch}
                  onChange={(e) => setTokenSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>

              {/* Token List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {tokensToDisplay.length > 0 ? (
                  tokensToDisplay.map((token) => (
                    <div
                      key={token.address}
                      onClick={() => setSelectedToken(token)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedToken?.address === token.address
                          ? 'bg-blue-50 border-blue-500 shadow-md'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {token.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{token.name}</div>
                            <div className="text-sm text-gray-600">{token.symbol}</div>
                            {token.holding && (
                              <div className="text-xs text-blue-600">Holdings: {token.holding.toFixed(6)}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-800">
                            ${token.price.toLocaleString()}
                          </div>
                          {token.priceChange24h !== undefined && (
                            <div className={`text-sm ${token.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h.toFixed(2)}%
                            </div>
                          )}
                          {token.totalValue && (
                            <div className="text-xs text-gray-500">
                              Value: ${token.totalValue.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-500">
                      {tokenSearch ? (
                        tokenSearch.startsWith('0x') ? 
                          'Searching for token...' : 
                          'No tokens found in portfolio'
                      ) : (
                        portfolioTokens.length === 0 ? 
                          'No tokens in portfolio. Buy some tokens first!' :
                          'Your portfolio tokens will appear here'
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Trading Interface */}
          <div className="space-y-6">
            {/* Current Holdings */}
            {holdings.length > 0 && (
              <Card className="bg-white/95 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-gray-800 flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Your Holdings ({holdings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {holdings.map((holding) => (
                      <div key={holding.id} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-800">{holding.token_symbol}</div>
                            <div className="text-sm text-gray-600">{holding.amount.toFixed(6)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Avg: {holding.average_buy_price.toFixed(6)} BASE</div>
                            <div className="text-sm text-gray-600">
                              Total: ${(holding.total_invested * basePrice.usd).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trade Interface */}
            <Card className="bg-white/95 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl">
              <CardHeader>
                <CardTitle className="text-gray-800">
                  {selectedToken ? `Trade ${selectedToken.symbol}` : 'Select a Token to Trade'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedToken ? (
                  <>
                    {/* Selected Token Info */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold">
                              {selectedToken.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-800">{selectedToken.name}</div>
                            <div className="text-sm text-gray-600">{selectedToken.symbol}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-800">
                            ${selectedToken.price.toLocaleString()}
                          </div>
                          {selectedToken.priceChange24h !== undefined && (
                            <div className={`text-sm ${selectedToken.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {selectedToken.priceChange24h >= 0 ? '+' : ''}{selectedToken.priceChange24h.toFixed(2)}% (24h)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Buy/Sell Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setTradeType('buy')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                          tradeType === 'buy'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Buy
                      </button>
                      <button
                        onClick={() => setTradeType('sell')}
                        className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                          tradeType === 'sell'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Sell
                      </button>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">
                        Amount ({selectedToken.symbol})
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={`Enter ${selectedToken.symbol} amount`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Trade Summary */}
                    {amount && (
                      <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Amount:</span>
                          <span className="font-semibold text-gray-800">{amount} {selectedToken.symbol}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Price per token:</span>
                          <span className="font-semibold text-gray-800">${selectedToken.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-gray-200 pt-2">
                          <span className="text-gray-600">Total:</span>
                          <span className="font-bold text-gray-800">
                            {(parseFloat(amount || '0') * selectedToken.price / basePrice.usd).toFixed(4)} BASE
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Trade Button */}
                    <Button
                      onClick={handleTrade}
                      disabled={!amount || isLoading || !isConnected || !profile}
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
                        `${tradeType === 'buy' ? 'Buy' : 'Sell'} ${selectedToken.symbol}`
                      )}
                    </Button>

                    {/* Balance Info */}
                    <div className="text-center text-sm text-gray-600">
                      Available: {tradeType === 'buy' 
                        ? `${availableBalance.toFixed(4)} BASE` 
                        : `${holdings.find(h => h.token_address === selectedToken.address)?.amount.toFixed(6) || '0'} ${selectedToken.symbol}`
                      }
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a Token</h3>
                    <p className="text-gray-600">Choose a token from your portfolio or search for new tokens</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="flex gap-4">
              <Button 
                onClick={() => navigate('/portfolio')}
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
          <p className="text-sm">Built for educational purposes. Trade responsibly in real markets.</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-blue-300">
            <span>Market Data: Live</span>
            <span>•</span>
            <span>Latency: <span className="text-green-400">12ms</span></span>
            <span>•</span>
            <span>Status: <span className="text-green-400">Active</span></span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TradesPage;
