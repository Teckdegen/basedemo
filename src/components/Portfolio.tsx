
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
}

interface PortfolioProps {
  balance: number;
  portfolio: Record<string, number>;
  tokenDetails: Record<string, TokenData>;
  basePrice: number;
  onTokenClick?: (tokenAddress: string) => void;
}

const Portfolio: React.FC<PortfolioProps> = ({ balance, portfolio, tokenDetails, basePrice, onTokenClick }) => {
  const navigate = useNavigate();
  const portfolioEntries = Object.entries(portfolio).filter(([_, amount]) => amount > 0);

  // Calculate portfolio value using actual token data and BASE price
  const totalPortfolioValue = portfolioEntries.reduce((total, [address, amount]) => {
    const tokenData = tokenDetails[address];
    if (tokenData) {
      return total + (amount * tokenData.price / basePrice);
    }
    return total;
  }, 0);

  // CHANGED LINE: starting balance is now 1.0, not 10.0
  const pnl = (balance + totalPortfolioValue) - 1.0; // Starting balance was 1.0 BASE
  const pnlPercentage = (pnl / 1.0) * 100;

  const totalValue = balance + totalPortfolioValue;

  const handleTokenClick = (address: string) => {
    if (onTokenClick) {
      onTokenClick(address);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Portfolio Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold">Portfolio</span>
            </div>
            <Button
              onClick={() => navigate('/app')}
              className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl text-sm"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Start Trading</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Total Value Display */}
          <div className="bg-gradient-to-r from-slate-700/50 to-slate-800/50 p-4 sm:p-6 rounded-2xl backdrop-blur-sm">
            <div className="text-center space-y-2 sm:space-y-3">
              <div className="text-sm text-slate-400 font-medium">Total Portfolio Value</div>
              <div className="text-2xl sm:text-4xl font-bold text-white">{totalValue.toFixed(4)} BASE</div>
              <div className="text-slate-300">${(totalValue * basePrice).toLocaleString()} USD</div>
              <div className={`text-base sm:text-lg font-semibold ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {pnl >= 0 ? '+' : ''}{pnl.toFixed(4)} BASE ({pnl >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
              </div>
            </div>
          </div>

          {/* BASE Balance */}
          <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">BASE</span>
                </div>
                <div>
                  <div className="font-semibold text-white text-base sm:text-lg">Base</div>
                  <div className="text-sm text-slate-400">BASE</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-white text-base sm:text-lg">{balance.toFixed(4)} BASE</div>
                <div className="text-sm text-slate-400">${(balance * basePrice).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Token Holdings Card */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <span className="text-lg">Token Holdings</span>
            <span className="text-sm text-slate-400">({portfolioEntries.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {portfolioEntries.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-6 sm:w-8 h-6 sm:h-8 text-slate-400" />
              </div>
              <div className="text-slate-300 font-medium mb-2">No tokens yet</div>
              <div className="text-sm text-slate-500 mb-4 sm:mb-6">Start trading to build your portfolio</div>
              <Button
                onClick={() => navigate('/app')}
                className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold px-4 sm:px-6 py-2 rounded-xl"
              >
                Start Trading
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolioEntries.map(([address, amount]) => {
                const tokenData = tokenDetails[address];
                
                if (!tokenData) {
                  return (
                    <div 
                      key={address} 
                      className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30 cursor-pointer hover:bg-slate-700/50 transition-colors"
                      onClick={() => handleTokenClick(address)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xs sm:text-sm">?</span>
                          </div>
                          <div>
                            <div className="font-semibold text-white">Unknown Token</div>
                            <div className="text-sm text-slate-400">{amount.toFixed(6)} tokens</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-400">--</div>
                          <div className="text-sm text-slate-500">Price unavailable</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                const valueInBase = amount * tokenData.price / basePrice;
                const tokenInitials = tokenData.symbol.substring(0, 2).toUpperCase();
                
                return (
                  <div 
                    key={address} 
                    className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                    onClick={() => handleTokenClick(address)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs sm:text-sm">{tokenInitials}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-white">{tokenData.name}</div>
                          <div className="text-sm text-slate-400">{amount.toFixed(6)} {tokenData.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">{valueInBase.toFixed(4)} BASE</div>
                        <div className="text-sm text-slate-400">${tokenData.price.toFixed(6)}</div>
                        <div className={`text-xs font-medium ${tokenData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tokenData.priceChange24h >= 0 ? '+' : ''}{tokenData.priceChange24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Portfolio;
