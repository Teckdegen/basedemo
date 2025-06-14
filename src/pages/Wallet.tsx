
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Trading</span>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BD</span>
            </div>
            <span className="text-xl font-bold text-gray-900">My Wallet</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Balance: <span className="font-semibold text-primary-800">{balance.toFixed(4)} ETH</span>
          </div>
          <ConnectButton />
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Portfolio balance={balance} portfolio={portfolio} tokenDetails={tokenDetails} />
          <TradeHistory trades={trades} />
        </div>
      </div>
    </div>
  );
};

export default Wallet;
