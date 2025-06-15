
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Volume2, RefreshCw, Hash, DollarSign, ChevronRight } from 'lucide-react';
import { fetchTrendingTokens, TrendingToken } from '@/services/dexScreenerService';
import { useBasePrice } from '@/hooks/useBasePrice';

interface TrendingTokensProps {
  onTokenSelect: (token: {
    address: string;
    name: string;
    symbol: string;
    price: number;
    priceChange24h: number;
    pairAddress?: string;
  }) => void;
}

const TrendingTokens: React.FC<TrendingTokensProps> = ({ onTokenSelect }) => {
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [loading, setLoading] = useState(true);
  const { priceData: basePrice } = useBasePrice();

  const fetchTokens = async () => {
    setLoading(true);
    try {
      const trendingTokens = await fetchTrendingTokens();
      setTokens(trendingTokens);
    } catch (error) {
      // no toasts or messages
      console.error('Error fetching trending tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleTokenClick = (token: TrendingToken) => {
    const tokenData = {
      address: token.baseToken.address,
      name: token.baseToken.name,
      symbol: token.baseToken.symbol,
      price: parseFloat(token.priceUsd || '0'),
      priceChange24h: token.priceChange?.h24 || 0,
      pairAddress: token.pairAddress
    };
    onTokenSelect(tokenData);
  };

  // Formatting numbers for icons only version (e.g., value shown as $5K, but here will just be an icon)
  return (
    <Card className="bg-black/40 backdrop-blur-md border-white/20 text-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          {/* Title Icon */}
          <TrendingUp className="w-6 h-6 text-cyan-400" />
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTokens}
            disabled={loading}
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse flex items-center gap-4">
                <Hash className="w-4 h-4 text-gray-500" />
                <DollarSign className="w-5 h-5 text-white" />
                <Volume2 className="w-5 h-5 text-cyan-400" />
              </div>
            ))}
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-8 flex flex-col items-center opacity-50">
            <TrendingDown className="w-12 h-12 mb-3" />
            <Volume2 className="w-7 h-7 mb-1" />
          </div>
        ) : (
          <div className="space-y-3">
            {tokens.map((token, index) => {
              const isUp = (token.priceChange?.h24 || 0) >= 0;
              return (
                <div
                  key={token.pairAddress}
                  onClick={() => handleTokenClick(token)}
                  className="bg-white/5 hover:bg-white/10 rounded-lg py-4 px-3 cursor-pointer transition-all duration-200 group flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Rank */}
                    <Hash className="w-5 h-5 text-gray-600" />
                    {/* Price Icon */}
                    <DollarSign className="w-6 h-6 text-white" />
                    {/* Direction */}
                    {isUp ? (
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-400" />
                    )}
                    {/* Volume */}
                    <Volume2 className="w-5 h-5 text-cyan-400" />
                  </div>
                  {/* Select/More */}
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-300 transition" />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendingTokens;

