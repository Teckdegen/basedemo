
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

export interface TokenSearchResult {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  marketCap?: number;
  dex: string;
  liquidity?: number;
  volume24h?: number;
  pairAddress?: string;
}

export const searchTokenByAddress = async (tokenAddress: string): Promise<TokenSearchResult | null> => {
  try {
    console.log('Searching for token:', tokenAddress);
    const response = await fetch(`${DEXSCREENER_API_BASE}/tokens/${tokenAddress}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch token data');
    }
    
    const data: TrendingTokensResponse = await response.json();
    console.log('API Response:', data);
    
    if (!data.pairs || data.pairs.length === 0) {
      return null;
    }
    
    // Find the pair with highest liquidity on Base network
    const basePairs = data.pairs.filter(pair => pair.chainId === 'base');
    if (basePairs.length === 0) {
      return null;
    }
    
    // Sort by liquidity (highest first) and take the most liquid pair
    const bestPair = basePairs.sort((a, b) => 
      (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
    )[0];
    
    return {
      address: bestPair.baseToken.address,
      name: bestPair.baseToken.name,
      symbol: bestPair.baseToken.symbol,
      price: parseFloat(bestPair.priceUsd),
      priceChange24h: bestPair.priceChange.h24,
      marketCap: bestPair.marketCap,
      dex: bestPair.dexId.charAt(0).toUpperCase() + bestPair.dexId.slice(1), // Capitalize DEX name
      liquidity: bestPair.liquidity?.usd,
      volume24h: bestPair.volume.h24,
      pairAddress: bestPair.pairAddress
    };
  } catch (error) {
    console.error('Error searching token:', error);
    return null;
  }
};

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
