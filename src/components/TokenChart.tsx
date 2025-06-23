
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
    <Card className="bg-transparent backdrop-blur-md border-white/20 text-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-lg">📈</span>
            </div>
            <div>
              <div className="text-lg font-bold">{tokenData.name}</div>
              <div className="text-sm text-gray-400">{tokenData.symbol}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold text-cyan-400">
              ${tokenData.price.toFixed(6)}
            </div>
            <div className={`text-sm font-semibold ${
              tokenData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              {tokenData.priceChange24h >= 0 ? '+' : ''}{tokenData.priceChange24h.toFixed(2)}% (24h)
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 sm:h-80 lg:h-96">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="rgba(255, 255, 255, 0.1)" 
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  interval="preserveStartEnd"
                  hide={window.innerWidth < 640}
                />
                <YAxis 
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  tickFormatter={formatPrice}
                  width={80}
                />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), tokenData.symbol]}
                  labelStyle={{ color: '#1F2937' }}
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke={tokenData.priceChange24h >= 0 ? '#10B981' : '#EF4444'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#06B6D4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading chart data...</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenChart;
