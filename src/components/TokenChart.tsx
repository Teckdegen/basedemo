
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  pairAddress?: string;
}

interface TokenChartProps {
  tokenData: TokenData;
}

interface ChartDataPoint {
  time: string;
  price: number;
}

const TokenChart: React.FC<TokenChartProps> = ({ tokenData }) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    // Generate mock price data for demonstration
    const generateMockData = (): ChartDataPoint[] => {
      const now = Date.now();
      const dataPoints = 50;
      const interval = 5 * 60 * 1000; // 5 minutes
      
      const data: ChartDataPoint[] = [];
      let currentPrice = tokenData.price;
      
      for (let i = dataPoints; i >= 0; i--) {
        const timestamp = now - (i * interval);
        
        // Add some realistic price movement
        const change = (Math.random() - 0.5) * 0.1;
        currentPrice += currentPrice * change;
        
        data.push({
          time: new Date(timestamp).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: Math.max(0.001, currentPrice)
        });
      }
      
      return data;
    };

    setChartData(generateMockData());
  }, [tokenData]);

  const formatPrice = (value: number) => `$${value.toFixed(6)}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>📈</span>
            <span>{tokenData.name} ({tokenData.symbol})</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">${tokenData.price.toFixed(6)}</div>
            <div className={`text-sm ${tokenData.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {tokenData.priceChange24h >= 0 ? '+' : ''}{tokenData.priceChange24h.toFixed(2)}% (24h)
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatPrice}
                />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), tokenData.symbol]}
                  labelStyle={{ color: '#1F2937' }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={tokenData.priceChange24h >= 0 ? '#10B981' : '#EF4444'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading chart data...</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenChart;
