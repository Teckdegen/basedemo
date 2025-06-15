import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, TrendingUp, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLocalWallet } from "@/hooks/useLocalWallet";

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

// Remove all static startingBase/base logic; use props.balance
const Portfolio: React.FC<PortfolioProps> = ({
  balance,
  portfolio,
  tokenDetails,
  basePrice,
  onTokenClick,
  coinLabel = "USDC"
}) => {
  // Read from portfolio prop
  const portfolioEntries = Object.entries(portfolio).filter(([_, amount]) => amount > 0);
  const totalPortfolioValue = portfolioEntries.reduce((total, [address, amount]) => {
    return total + amount;
  }, 0);

  const isBrandNewUser = totalPortfolioValue === 1500 && portfolioEntries.length === 1 && portfolioEntries[0][0] === "base-usdc";
  const pnl = 0;
  const pnlPercentage = 0;

  const handleTokenClick = (address: string) => {
    if (onTokenClick) onTokenClick(address);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Portfolio Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 rounded-2xl p-6 text-white overflow-hidden">
        {/* ... header with Portfolio ... */}
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M5 13V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a6 6 0 1 1-12 0Z" /></svg>
            </div>
            <span className="text-lg sm:text-xl font-bold">Portfolio</span>
          </div>
        </div>
        {/* Total Value and Balance */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4">
          <div>
            <div className="text-sm text-slate-400 font-medium">Total Portfolio Value</div>
            <div className="text-2xl sm:text-4xl font-bold text-white">{balance.toFixed(4)} {coinLabel}</div>
            <div className="text-slate-300">${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD</div>
          </div>
          <div className="mt-4 sm:mt-0 text-base sm:text-lg font-semibold text-green-400">+0.0000 {coinLabel} (+0.00%)</div>
        </div>
        {isBrandNewUser && (
          <div className="mt-2 text-xs text-cyan-400">All users receive 1500 USDC (in base) to start trading!</div>
        )}
      </div>

      {/* Token Holdings Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 rounded-2xl p-6 text-white">
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg">Token Holdings</span>
          <span className="text-sm text-slate-400">({portfolioEntries.length})</span>
        </div>
        <div className="space-y-3">
          {portfolioEntries.map(([token, amount]) => (
            <div
              key={token}
              className="bg-slate-700/30 p-4 rounded-xl border border-slate-600/30 hover:bg-slate-700/50 transition-colors cursor-pointer"
              onClick={() => handleTokenClick(token)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">{tokenDetails[token]?.symbol?.slice(0,2) || "?"}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">{tokenDetails[token]?.name || token}</div>
                    <div className="text-sm text-slate-400">{amount.toFixed(6)} {tokenDetails[token]?.symbol || ""}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">{amount.toFixed(4)} {tokenDetails[token]?.symbol || ""}</div>
                  <div className="text-sm text-slate-400">${
                    (tokenDetails[token]?.price || 1).toFixed(6)
                  }</div>
                  <div className="text-xs font-medium text-green-400">
                    +0.00%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
