
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>💰</span>
          <span>Portfolio</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Portfolio Summary */}
        <div className="bg-primary-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Total Value</div>
              <div className="text-lg font-bold">{totalValue.toFixed(4)} ETH</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">P&L</div>
              <div className={`text-lg font-bold ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {pnl >= 0 ? '+' : ''}{pnl.toFixed(4)} ETH
                <span className="text-sm ml-1">
                  ({pnl >= 0 ? '+' : ''}{pnlPercentage.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cash Balance */}
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="text-sm text-gray-600">ETH Balance</div>
            <div className="font-semibold">{balance.toFixed(4)} ETH</div>
          </div>
          <div className="text-2xl">💎</div>
        </div>

        {/* Token Holdings */}
        <div>
          <div className="text-sm text-gray-600 mb-2">Token Holdings</div>
          {portfolioEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tokens in portfolio
            </div>
          ) : (
            <div className="space-y-2">
              {portfolioEntries.map(([address, amount]) => {
                const tokenData = tokenDetails[address];
                
                if (!tokenData) {
                  return (
                    <div key={address} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                      <div>
                        <div className="font-medium">Unknown Token</div>
                        <div className="text-sm text-gray-600">{amount.toFixed(6)} tokens</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Unknown Value</div>
                        <div className="text-sm text-gray-600">Price unavailable</div>
                      </div>
                    </div>
                  );
                }
                
                const value = amount * tokenData.price;
                
                return (
                  <div key={address} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                    <div>
                      <div className="font-medium">{tokenData.symbol}</div>
                      <div className="text-xs text-gray-500 mb-1">{tokenData.name}</div>
                      <div className="text-sm text-gray-600">{amount.toFixed(6)} tokens</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{value.toFixed(4)} ETH</div>
                      <div className="text-sm text-gray-600">${tokenData.price.toFixed(6)}</div>
                      <div className={`text-xs ${tokenData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tokenData.priceChange24h >= 0 ? '+' : ''}{tokenData.priceChange24h.toFixed(2)}% (24h)
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
