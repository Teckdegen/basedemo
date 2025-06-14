
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

const TokenChart: React.FC<TokenChartProps> = ({ tokenData }) => {
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    // Generate mock price data for demonstration
    const generateMockData = () => {
      const now = Date.now();
      const dataPoints = 50;
      const interval = 5 * 60 * 1000; // 5 minutes
      
      const labels = [];
      const prices = [];
      let currentPrice = tokenData.price;
      
      for (let i = dataPoints; i >= 0; i--) {
        const timestamp = now - (i * interval);
        labels.push(new Date(timestamp).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }));
        
        // Add some realistic price movement
        const change = (Math.random() - 0.5) * 0.1;
        currentPrice += currentPrice * change;
        prices.push(currentPrice);
      }
      
      return { labels, prices };
    };

    const mockData = generateMockData();
    
    setChartData({
      labels: mockData.labels,
      datasets: [
        {
          label: `${tokenData.symbol} Price`,
          data: mockData.prices,
          borderColor: tokenData.priceChange24h >= 0 ? '#10B981' : '#EF4444',
          backgroundColor: tokenData.priceChange24h >= 0 
            ? 'rgba(16, 185, 129, 0.1)' 
            : 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    });
  }, [tokenData]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#1F2937',
        bodyColor: '#1F2937',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return `$${context.parsed.y.toFixed(6)}`;
          }
        }
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 8,
        },
      },
      y: {
        display: true,
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value: any) {
            return `$${value.toFixed(6)}`;
          },
        },
      },
    },
  };

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
          {chartData ? (
            <Line data={chartData} options={options} />
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
