
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';

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
}

const Portfolio: React.FC<PortfolioProps> = ({ balance, portfolio, tokenDetails }) => {
  const portfolioEntries = Object.entries(portfolio).filter(([_, amount]) => amount > 0);
  
  // Calculate portfolio value using actual token data
  const totalPortfolioValue = portfolioEntries.reduce((total, [address, amount]) => {
    const tokenData = tokenDetails[address];
    if (tokenData) {
      return total + (amount * tokenData.price);
    }
    return total;
  }, 0);

  const totalValue = balance + totalPortfolioValue;
  const pnl = totalValue - 10; // Starting balance was 10 ETH
  const pnlPercentage = (pnl / 10) * 100;

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2 text-slate-800">
          <Wallet className="w-5 h-5" />
          <span>Wallet</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-2xl text-white">
          <div className="space-y-4">
            <div>
              <div className="text-blue-100 text-sm">Total Portfolio Value</div>
              <div className="text-3xl font-bold">{totalValue.toFixed(4)} ETH</div>
              <div className="text-blue-100 text-sm">${(totalValue * 3000).toLocaleString()} USD</div>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-blue-100 text-sm">24h P&L</div>
                <div className={`text-lg font-semibold ${pnl >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {pnl >= 0 ? '+' : ''}{pnl.toFixed(4)} ETH ({pnl >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ETH Balance Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                ETH
              </div>
              <div>
                <div className="font-semibold text-slate-900">Ethereum</div>
                <div className="text-sm text-slate-500">ETH</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-900">{balance.toFixed(4)} ETH</div>
              <div className="text-sm text-slate-500">${(balance * 3000).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Token Holdings */}
        <div>
          <div className="text-sm font-medium text-slate-600 mb-3">Token Holdings ({portfolioEntries.length})</div>
          {portfolioEntries.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Wallet className="w-8 h-8 text-slate-400" />
              </div>
              <div className="text-slate-500 font-medium">No tokens yet</div>
              <div className="text-sm text-slate-400">Start trading to build your portfolio</div>
            </div>
          ) : (
            <div className="space-y-3">
              {portfolioEntries.map(([address, amount]) => {
                const tokenData = tokenDetails[address];
                
                if (!tokenData) {
                  return (
                    <div key={address} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                            ?
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">Unknown Token</div>
                            <div className="text-sm text-slate-500">{amount.toFixed(6)} tokens</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-500">--</div>
                          <div className="text-sm text-slate-400">Price unavailable</div>
                        </div>
                      </div>
                    </div>
                  );
                }
                
                const value = amount * tokenData.price;
                const tokenInitials = tokenData.symbol.substring(0, 2).toUpperCase();
                
                return (
                  <div key={address} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {tokenInitials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{tokenData.name}</div>
                          <div className="text-sm text-slate-500">{amount.toFixed(6)} {tokenData.symbol}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-slate-900">{value.toFixed(4)} ETH</div>
                        <div className="text-sm text-slate-500">${tokenData.price.toFixed(6)}</div>
                        <div className={`text-xs font-medium ${tokenData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tokenData.priceChange24h >= 0 ? '+' : ''}{tokenData.priceChange24h.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Portfolio;
