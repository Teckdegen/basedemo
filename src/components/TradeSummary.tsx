
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';

interface TradeSummaryData {
  tokenSymbol: string;
  tokenName: string;
  tradeType: 'buy' | 'sell';
  amount: number;
  pricePerToken: number;
  totalBase: number;
  basePrice: number;
  
  // P&L data for sells
  totalInvested?: number;
  totalReceived?: number;
  realizedPnL?: number;
  realizedPnLPercent?: number;
  
  // Holdings data
  remainingAmount?: number;
  avgBuyPrice?: number;
}

interface TradeSummaryProps {
  tradeData: TradeSummaryData;
  onClose: () => void;
  onViewPnL: () => void;
}

const TradeSummary: React.FC<TradeSummaryProps> = ({ tradeData, onClose, onViewPnL }) => {
  const {
    tokenSymbol,
    tokenName,
    tradeType,
    amount,
    pricePerToken,
    totalBase,
    basePrice,
    totalInvested,
    totalReceived,
    realizedPnL,
    realizedPnLPercent,
    remainingAmount,
    avgBuyPrice
  } = tradeData;

  const usdValue = totalBase * basePrice;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 text-white w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              tradeType === 'buy' ? 'bg-green-500/20' : 'bg-blue-500/20'
            }`}>
              <CheckCircle className={`w-8 h-8 ${
                tradeType === 'buy' ? 'text-green-400' : 'text-blue-400'
              }`} />
            </div>
          </div>
          <CardTitle className="text-xl">
            Trade Executed Successfully!
          </CardTitle>
          <p className="text-gray-400">
            {tradeType === 'buy' ? 'Bought' : 'Sold'} {tokenSymbol}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Trade Details */}
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg">{tokenName} ({tokenSymbol})</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-400">Amount</div>
                <div className="font-semibold">{amount.toFixed(6)} {tokenSymbol}</div>
              </div>
              <div>
                <div className="text-gray-400">Price per Token</div>
                <div className="font-semibold">{pricePerToken.toFixed(8)} BASE</div>
              </div>
              <div>
                <div className="text-gray-400">Total BASE</div>
                <div className="font-semibold">{totalBase.toFixed(6)} BASE</div>
              </div>
              <div>
                <div className="text-gray-400">USD Value</div>
                <div className="font-semibold">${usdValue.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {/* P&L Section for Sells */}
          {tradeType === 'sell' && realizedPnL !== undefined && (
            <div className={`rounded-lg p-4 ${
              realizedPnL >= 0 ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <div className="flex items-center space-x-2 mb-3">
                {realizedPnL >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
                <h3 className="font-semibold">Realized Profit & Loss</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Total Invested</div>
                  <div className="font-semibold">{totalInvested?.toFixed(6)} BASE</div>
                </div>
                <div>
                  <div className="text-gray-400">Total Received</div>
                  <div className="font-semibold">{totalReceived?.toFixed(6)} BASE</div>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-white/10">
                <div className={`text-xl font-bold ${
                  realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {realizedPnL >= 0 ? '+' : ''}{realizedPnL.toFixed(6)} BASE
                </div>
                <div className={`text-sm ${
                  realizedPnL >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  ({realizedPnLPercent && realizedPnLPercent >= 0 ? '+' : ''}{realizedPnLPercent?.toFixed(2)}%)
                </div>
              </div>
            </div>
          )}

          {/* Remaining Holdings */}
          {remainingAmount !== undefined && remainingAmount > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Remaining Holdings</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400">Amount</div>
                  <div className="font-semibold">{remainingAmount.toFixed(6)} {tokenSymbol}</div>
                </div>
                <div>
                  <div className="text-gray-400">Avg Buy Price</div>
                  <div className="font-semibold">{avgBuyPrice?.toFixed(8)} BASE</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onViewPnL}
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              View Full P&L
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              Continue Trading
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradeSummary;
