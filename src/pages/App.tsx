import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import TokenScanner from '@/components/TokenScanner';
import TokenChart from '@/components/TokenChart';
import Portfolio from '@/components/Portfolio';
import TradeHistory from '@/components/TradeHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  pairAddress?: string;
}

interface Trade {
  id: string;
  tokenAddress: string;
  tokenSymbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  timestamp: number;
}

const App = () => {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [tradeAmount, setTradeAmount] = useState('');
  const [balance, setBalance] = useState(10); // Starting with 10 ETH
  const [portfolio, setPortfolio] = useState<Record<string, number>>({});
  const [trades, setTrades] = useState<Trade[]>([]);
  const [tokenDetails, setTokenDetails] = useState<Record<string, TokenData>>({});

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  useEffect(() => {
    // Load user data from localStorage
    if (address) {
      const savedData = localStorage.getItem(`baseDemo_${address}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        setBalance(data.balance || 10);
        setPortfolio(data.portfolio || {});
        setTrades(data.trades || []);
        setTokenDetails(data.tokenDetails || {});
      }
    }
  }, [address]);

  const saveUserData = (newBalance: number, newPortfolio: Record<string, number>, newTrades: Trade[], newTokenDetails: Record<string, TokenData>) => {
    if (address) {
      const data = {
        balance: newBalance,
        portfolio: newPortfolio,
        trades: newTrades,
        tokenDetails: newTokenDetails
      };
      localStorage.setItem(`baseDemo_${address}`, JSON.stringify(data));
    }
  };

  const handleTokenSelect = (token: TokenData) => {
    setSelectedToken(token);
    
    // Store token details for portfolio display
    const newTokenDetails = { ...tokenDetails };
    newTokenDetails[token.address] = token;
    setTokenDetails(newTokenDetails);
    
    if (address) {
      const savedData = localStorage.getItem(`baseDemo_${address}`);
      if (savedData) {
        const data = JSON.parse(savedData);
        saveUserData(data.balance || balance, data.portfolio || portfolio, data.trades || trades, newTokenDetails);
      }
    }
  };

  const handleBuy = () => {
    if (!selectedToken || !tradeAmount) return;
    
    const amount = parseFloat(tradeAmount);
    const total = amount * selectedToken.price;
    
    if (total > balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough ETH for this trade",
        variant: "destructive"
      });
      return;
    }

    const newBalance = balance - total;
    const newPortfolio = { ...portfolio };
    newPortfolio[selectedToken.address] = (newPortfolio[selectedToken.address] || 0) + amount;
    
    const newTrade: Trade = {
      id: Date.now().toString(),
      tokenAddress: selectedToken.address,
      tokenSymbol: selectedToken.symbol,
      type: 'buy',
      amount,
      price: selectedToken.price,
      total,
      timestamp: Date.now()
    };
    
    const newTrades = [newTrade, ...trades];
    
    setBalance(newBalance);
    setPortfolio(newPortfolio);
    setTrades(newTrades);
    setTradeAmount('');
    
    saveUserData(newBalance, newPortfolio, newTrades, tokenDetails);
    
    toast({
      title: "Trade Executed",
      description: `Bought ${amount} ${selectedToken.symbol} for ${total.toFixed(4)} ETH`
    });
  };

  const handleSell = () => {
    if (!selectedToken || !tradeAmount) return;
    
    const amount = parseFloat(tradeAmount);
    const currentHolding = portfolio[selectedToken.address] || 0;
    
    if (amount > currentHolding) {
      toast({
        title: "Insufficient Tokens",
        description: "You don't have enough tokens to sell",
        variant: "destructive"
      });
      return;
    }

    const total = amount * selectedToken.price;
    const newBalance = balance + total;
    const newPortfolio = { ...portfolio };
    newPortfolio[selectedToken.address] = currentHolding - amount;
    
    if (newPortfolio[selectedToken.address] === 0) {
      delete newPortfolio[selectedToken.address];
    }
    
    const newTrade: Trade = {
      id: Date.now().toString(),
      tokenAddress: selectedToken.address,
      tokenSymbol: selectedToken.symbol,
      type: 'sell',
      amount,
      price: selectedToken.price,
      total,
      timestamp: Date.now()
    };
    
    const newTrades = [newTrade, ...trades];
    
    setBalance(newBalance);
    setPortfolio(newPortfolio);
    setTrades(newTrades);
    setTradeAmount('');
    
    saveUserData(newBalance, newPortfolio, newTrades, tokenDetails);
    
    toast({
      title: "Trade Executed",
      description: `Sold ${amount} ${selectedToken.symbol} for ${total.toFixed(4)} ETH`
    });
  };

  if (!isConnected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BD</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Base Demo</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Balance: <span className="font-semibold text-primary-800">{balance.toFixed(4)} ETH</span>
          </div>
          <ConnectButton />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Token Scanner & Trading */}
          <div className="lg:col-span-1 space-y-6">
            <TokenScanner onTokenSelect={handleTokenSelect} />
            
            {selectedToken && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Trade {selectedToken.symbol}</span>
                    <span className={`text-sm ${selectedToken.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedToken.priceChange24h >= 0 ? '+' : ''}{selectedToken.priceChange24h.toFixed(2)}%
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Current Price</div>
                    <div className="text-2xl font-bold text-primary-800">${selectedToken.price.toFixed(6)}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Amount</div>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={tradeAmount}
                      onChange={(e) => setTradeAmount(e.target.value)}
                    />
                  </div>
                  
                  {tradeAmount && (
                    <div className="text-sm text-gray-600">
                      Total: {(parseFloat(tradeAmount) * selectedToken.price).toFixed(6)} ETH
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={handleBuy}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      disabled={!tradeAmount || parseFloat(tradeAmount) <= 0}
                    >
                      Buy
                    </Button>
                    <Button 
                      onClick={handleSell}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      disabled={!tradeAmount || parseFloat(tradeAmount) <= 0 || (portfolio[selectedToken.address] || 0) === 0}
                    >
                      Sell
                    </Button>
                  </div>
                  
                  {portfolio[selectedToken.address] && (
                    <div className="text-sm text-gray-600">
                      You own: {portfolio[selectedToken.address].toFixed(6)} {selectedToken.symbol}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Chart & Portfolio */}
          <div className="lg:col-span-2 space-y-6">
            {selectedToken && (
              <TokenChart tokenData={selectedToken} />
            )}
            
            <div className="grid md:grid-cols-2 gap-6">
              <Portfolio balance={balance} portfolio={portfolio} tokenDetails={tokenDetails} />
              <TradeHistory trades={trades} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
