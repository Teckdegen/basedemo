
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

interface TradeHistoryProps {
  trades: Trade[];
}

const TradeHistory: React.FC<TradeHistoryProps> = ({ trades }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-black/40 backdrop-blur-md border-white/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🕘</span>
          <span>Trade History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No trades yet
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {trades.slice(0, 10).map((trade) => (
              <div key={trade.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      trade.type === 'buy' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.type.toUpperCase()}
                    </span>
                    <span className="font-medium text-white">{trade.tokenSymbol}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {formatDate(trade.timestamp)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-white">
                    {trade.amount.toFixed(6)} tokens
                  </div>
                  <div className="text-sm text-gray-400">
                    {trade.total.toFixed(4)} BASE
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TradeHistory;
