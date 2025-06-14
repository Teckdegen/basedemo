
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PortfolioProps {
  balance: number;
  portfolio: Record<string, number>;
}

const Portfolio: React.FC<PortfolioProps> = ({ balance, portfolio }) => {
  const portfolioEntries = Object.entries(portfolio).filter(([_, amount]) => amount > 0);
  
  // Mock current prices for portfolio calculation
  const mockPrices: Record<string, number> = {};
  portfolioEntries.forEach(([address, _]) => {
    mockPrices[address] = Math.random() * 10 + 0.1;
  });

  const totalPortfolioValue = portfolioEntries.reduce((total, [address, amount]) => {
    return total + (amount * (mockPrices[address] || 0));
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
                const currentPrice = mockPrices[address] || 0;
                const value = amount * currentPrice;
                
                return (
                  <div key={address} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                    <div>
                      <div className="font-medium">DEMO</div>
                      <div className="text-sm text-gray-600">{amount.toFixed(6)} tokens</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{value.toFixed(4)} ETH</div>
                      <div className="text-sm text-gray-600">${currentPrice.toFixed(6)}</div>
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
