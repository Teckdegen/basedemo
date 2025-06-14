
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Volume2, RefreshCw } from 'lucide-react';
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
      console.error('Error fetching trending tokens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
    // Refresh every 5 minutes
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

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(0)}K`;
    }
    return `$${volume.toFixed(0)}`;
  };

  const formatPrice = (price: string) => {
    const priceNum = parseFloat(price);
    if (priceNum < 0.01) {
      return `$${priceNum.toFixed(6)}`;
    } else if (priceNum < 1) {
      return `$${priceNum.toFixed(4)}`;
    }
    return `$${priceNum.toFixed(2)}`;
  };

  return (
    <Card className="bg-black/40 backdrop-blur-md border-white/20 text-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Trending on Base
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTokens}
            disabled={loading}
            className="text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-lg p-3 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : tokens.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No trending tokens found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tokens.map((token, index) => (
              <div
                key={token.pairAddress}
                onClick={() => handleTokenClick(token)}
                className="bg-white/5 hover:bg-white/10 rounded-lg p-3 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-400 font-mono">#{index + 1}</span>
                      <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {token.baseToken.symbol}
                      </span>
                      <span className="text-sm text-gray-400 truncate">
                        {token.baseToken.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-white font-medium">
                        {formatPrice(token.priceUsd)}
                      </span>
                      <span className={`flex items-center gap-1 ${
                        (token.priceChange?.h24 || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {(token.priceChange?.h24 || 0) >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {(token.priceChange?.h24 || 0) >= 0 ? '+' : ''}
                        {(token.priceChange?.h24 || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                      <Volume2 className="w-3 h-3" />
                      <span>24h Vol</span>
                    </div>
                    <span className="text-sm font-medium text-cyan-400">
                      {formatVolume(token.volume?.h24 || 0)}
                    </span>
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

export default TrendingTokens;
