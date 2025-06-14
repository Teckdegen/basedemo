
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TokenScanner from '@/components/TokenScanner';
import TokenChart from '@/components/TokenChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useBasePrice } from '@/hooks/useBasePrice';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Wallet, Menu, RefreshCw, LogOut } from 'lucide-react';

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  pairAddress?: string;
}

const App = () => {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { priceData: basePrice, loading: priceLoading, refreshPrice } = useBasePrice();
  const { user, signOut } = useAuth();
  const { profile, executeTrade, loading: dataLoading } = useSupabaseData();
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');

  useEffect(() => {
    if (!isConnected || !user) {
      navigate('/auth');
    }
  }, [isConnected, user, navigate]);

  const handleTokenSelect = (token: TokenData) => {
    setSelectedToken(token);
    
    // Save token data to localStorage for the trading page
    const savedTokens = JSON.parse(localStorage.getItem('scannedTokens') || '{}');
    savedTokens[token.address] = token;
    localStorage.setItem('scannedTokens', JSON.stringify(savedTokens));
  };

  const handleBuy = async () => {
    if (!selectedToken || !tradeAmount || !profile) return;
    
    await refreshPrice();
    
    const amount = parseFloat(tradeAmount);
    const tokenPriceInBase = selectedToken.price / basePrice.usd;
    const total = amount * tokenPriceInBase;
    
    if (total > profile.base_balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough BASE for this trade",
        variant: "destructive"
      });
      return;
    }

    const { error } = await executeTrade(
      selectedToken.address,
      selectedToken.symbol,
      selectedToken.name,
      'buy',
      amount,
      tokenPriceInBase,
      total,
      basePrice.usd
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
        description: `Bought ${amount} ${selectedToken.symbol} for ${total.toFixed(4)} BASE`
      });
      setTradeAmount('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!isConnected || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation - Responsive */}
      <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">BD</span>
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">Base DEX</span>
            </div>

            {/* Center - Balance and BASE Price */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-cyan-400 text-sm font-medium">
                  {profile?.base_balance.toFixed(4) || '0.0000'} BASE
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 flex items-center space-x-2">
                <span className="text-green-400 text-sm font-medium">
                  BASE: ${basePrice.usd.toFixed(2)}
                </span>
                <button 
                  onClick={refreshPrice} 
                  disabled={priceLoading}
                  className="text-white/60 hover:text-white transition-colors"
                >
                  <RefreshCw className={`w-3 h-3 ${priceLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/wallet')}
                className="text-white hover:bg-white/10 hidden sm:flex"
              >
                <Wallet className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Wallet</span>
              </Button>
              
              {/* Mobile wallet button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/wallet')}
                className="text-white hover:bg-white/10 sm:hidden"
              >
                <Wallet className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              
              <div className="scale-90 sm:scale-100">
                <ConnectButton />
              </div>
            </div>
          </div>

          {/* Mobile balance and price */}
          <div className="md:hidden pb-3 flex items-center space-x-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-cyan-400 text-sm font-medium">
                Balance: {profile?.base_balance.toFixed(4) || '0.0000'} BASE
              </span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-2 flex items-center space-x-2">
              <span className="text-green-400 text-sm font-medium">
                ${basePrice.usd.toFixed(2)}
              </span>
              <button 
                onClick={refreshPrice} 
                disabled={priceLoading}
                className="text-white/60 hover:text-white transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${priceLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Fully Responsive */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          
          {/* Left Column - Token Scanner & Trading */}
          <div className="space-y-6">
            <TokenScanner onTokenSelect={handleTokenSelect} />
            
            {selectedToken && (
              <Card className="bg-black/40 backdrop-blur-md border-white/20 text-white">
                <CardHeader className="pb-4">
                  <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span className="text-lg sm:text-xl">Trade {selectedToken.symbol}</span>
                    <span className={`text-sm font-semibold ${
                      selectedToken.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {selectedToken.priceChange24h >= 0 ? '+' : ''}{selectedToken.priceChange24h.toFixed(2)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Price Display */}
                  <div className="bg-white/5 p-4 rounded-xl">
                    <div className="text-sm text-gray-400 mb-1">Current Price</div>
                    <div className="text-2xl sm:text-3xl font-bold text-cyan-400">
                      ${selectedToken.price.toFixed(6)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {(selectedToken.price / basePrice.usd).toFixed(8)} BASE
                    </div>
                  </div>
                  
                  {/* Trade Input */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 block mb-2">Amount to Trade</label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={tradeAmount}
                        onChange={(e) => setTradeAmount(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder-gray-500 h-12 text-lg"
                      />
                    </div>
                    
                    {tradeAmount && (
                      <div className="bg-blue-500/20 p-3 rounded-lg">
                        <div className="text-sm text-gray-300">
                          Total: <span className="text-cyan-400 font-semibold">
                            {((parseFloat(tradeAmount) * selectedToken.price) / basePrice.usd).toFixed(6)} BASE
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          ${(parseFloat(tradeAmount) * selectedToken.price).toFixed(2)} USD
                        </div>
                      </div>
                    )}
                    
                    {/* Trading Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        onClick={handleBuy}
                        className="h-12 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold text-base"
                        disabled={!tradeAmount || parseFloat(tradeAmount) <= 0 || priceLoading || dataLoading}
                      >
                        {priceLoading || dataLoading ? 'Processing...' : 'Buy'}
                      </Button>
                      <Button 
                        onClick={() => navigate(`/trade/${selectedToken.address}`)}
                        className="h-12 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold text-base"
                      >
                        Advanced Trade
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Chart */}
          <div className="space-y-6">
            {selectedToken ? (
              <TokenChart tokenData={selectedToken} />
            ) : (
              <Card className="bg-black/40 backdrop-blur-md border-white/20 text-white h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Select a Token</h3>
                  <p className="text-gray-400">Choose a token to view its chart and start trading</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
