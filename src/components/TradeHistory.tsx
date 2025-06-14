
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🕘</span>
          <span>Trade History</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No trades yet
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {trades.slice(0, 10).map((trade) => (
              <div key={trade.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      trade.type === 'buy' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {trade.type.toUpperCase()}
                    </span>
                    <span className="font-medium">{trade.tokenSymbol}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDate(trade.timestamp)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {trade.amount.toFixed(6)} tokens
                  </div>
                  <div className="text-sm text-gray-600">
                    {trade.total.toFixed(4)} ETH
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
