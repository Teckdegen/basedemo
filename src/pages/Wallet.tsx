
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Portfolio from '@/components/Portfolio';
import TradeHistory from '@/components/TradeHistory';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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

const Wallet = () => {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(10);
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

  if (!isConnected) {
    return null;
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
                <span className="text-xl font-bold text-white hidden sm:block">My Wallet</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-cyan-400 text-sm font-medium">
                  Balance: {balance.toFixed(4)} BASE
                </span>
              </div>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <Portfolio balance={balance} portfolio={portfolio} tokenDetails={tokenDetails} />
          <TradeHistory trades={trades} />
        </div>
      </div>
    </div>
  );
};

export default Wallet;
