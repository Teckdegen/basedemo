
const DEXSCREENER_API_BASE = 'https://api.dexscreener.com/latest/dex';

export interface TrendingToken {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  marketCap?: number;
}

export interface TrendingTokensResponse {
  schemaVersion: string;
  pairs: TrendingToken[];
}

export const fetchTrendingTokens = async (): Promise<TrendingToken[]> => {
  try {
    // Fetch trending tokens from Base network
    const response = await fetch(`${DEXSCREENER_API_BASE}/search?q=base`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch trending tokens');
    }
    
    const data: TrendingTokensResponse = await response.json();
    
    // Filter for Base network tokens and sort by volume
    const baseTokens = data.pairs
      .filter(pair => pair.chainId === 'base')
      .filter(pair => pair.volume?.h24 > 1000) // Filter tokens with decent volume
      .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
      .slice(0, 10); // Take top 10
    
    return baseTokens;
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    return [];
  }
};

export const fetchTokensByVolume = async (): Promise<TrendingToken[]> => {
  try {
    // Alternative endpoint for tokens sorted by volume
    const response = await fetch(`${DEXSCREENER_API_BASE}/tokens/base`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tokens by volume');
    }
    
    const data: TrendingTokensResponse = await response.json();
    
    return data.pairs
      .filter(pair => pair.volume?.h24 > 5000)
      .sort((a, b) => (b.volume?.h24 || 0) - (a.volume?.h24 || 0))
      .slice(0, 8);
  } catch (error) {
    console.error('Error fetching tokens by volume:', error);
    return [];
  }
};
