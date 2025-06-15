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
  coinLabel?: string;
}

const Portfolio: React.FC<PortfolioProps> = ({
  balance,
  portfolio,
  tokenDetails,
  basePrice,
  onTokenClick,
  coinLabel = "USDC"
}) => {
  // Everything will just represent the single base-usdc static holding
  const portfolioEntries = Object.entries(portfolio).filter(([_, amount]) => amount > 0);

  // No need to calculate from API
  const totalPortfolioValue = portfolioEntries.reduce((total, [address, amount]) => {
    // All values are 1:1
    return total + amount;
  }, 0);

  const startingBase = 1500;
  const totalValue = balance; // Only 1500; extra tokens = same USDC, so always equals balance
  const isBrandNewUser = totalValue === startingBase && portfolioEntries.length === 1 && portfolioEntries[0][0] === "base-usdc";
  const pnl = 0;             // No PNL possible in static mode
  const pnlPercentage = 0;

  const handleTokenClick = (address: string) => {
    if (onTokenClick) onTokenClick(address);
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
              onClick={() => window.location.href = '/app'}
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
              <div className="text-2xl sm:text-4xl font-bold text-white">{startingBase.toFixed(4)} {coinLabel}</div>
              <div className="text-slate-300">${(startingBase).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD</div>
              <div className="text-base sm:text-lg font-semibold text-green-400">
                +0.0000 {coinLabel} (+0.00%)
              </div>
              {isBrandNewUser && (
                <div className="mt-2 text-xs text-cyan-400">All users receive 1500 USDC (in base) to start trading!</div>
              )}
            </div>
          </div>

          {/* Balance */}
          <div className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">{coinLabel}</span>
                </div>
                <div>
                  <div className="font-semibold text-white text-base sm:text-lg">{coinLabel}</div>
                  <div className="text-sm text-slate-400">{coinLabel}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-white text-base sm:text-lg">{startingBase.toFixed(4)} {coinLabel}</div>
                <div className="text-sm text-slate-400">${startingBase.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
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
            <span className="text-sm text-slate-400">(1)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-3">
              <div 
                className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
                onClick={() => handleTokenClick("base-usdc")}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-xs sm:text-sm">US</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">Base USDC</div>
                      <div className="text-sm text-slate-400">1500.000000 USDC</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-white">1500.0000 USDC</div>
                    <div className="text-sm text-slate-400">$1.000000</div>
                    <div className="text-xs font-medium text-green-400">
                      +0.00%
                    </div>
                  </div>
                </div>
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Portfolio;
