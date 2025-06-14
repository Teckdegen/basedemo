
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export interface PriceData {
  usd: number;
  usd_24h_change: number;
}

export interface TokenPriceData extends PriceData {
  lastUpdated: number;
}

// Cache for token prices to avoid excessive API calls
const priceCache = new Map<string, TokenPriceData>();
const CACHE_DURATION = 300000; // 5 minutes cache (300 seconds)

export const fetchBasePrice = async (): Promise<PriceData> => {
  // Check cache first for BASE price
  const cached = priceCache.get('base-protocol');
  const now = Date.now();
  
  if (cached && (now - cached.lastUpdated) < CACHE_DURATION) {
    console.log('Using cached BASE price:', cached);
    return {
      usd: cached.usd,
      usd_24h_change: cached.usd_24h_change
    };
  }

  try {
    // Use consistent source - base-protocol token
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=base-protocol&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data['base-protocol']?.usd) {
        const priceData = {
          usd: data['base-protocol'].usd,
          usd_24h_change: data['base-protocol'].usd_24h_change || 0,
          lastUpdated: now
        };
        
        // Cache the result
        priceCache.set('base-protocol', priceData);
        console.log('BASE price fetched and cached:', priceData);
        
        return {
          usd: priceData.usd,
          usd_24h_change: priceData.usd_24h_change
        };
      }
    }
    
    throw new Error('Failed to fetch BASE price from primary source');
  } catch (error) {
    console.error('Error fetching BASE price:', error);
    
    // Return cached data if available, otherwise fallback
    if (cached) {
      console.log('Using expired cached BASE price due to error:', cached);
      return {
        usd: cached.usd,
        usd_24h_change: cached.usd_24h_change
      };
    }
    
    // Consistent fallback price
    const fallbackPrice = {
      usd: 0.27,
      usd_24h_change: 0,
      lastUpdated: now
    };
    priceCache.set('base-protocol', fallbackPrice);
    
    return {
      usd: fallbackPrice.usd,
      usd_24h_change: fallbackPrice.usd_24h_change
    };
  }
};

export const fetchTokenPrice = async (tokenId: string): Promise<PriceData> => {
  // Check cache first
  const cached = priceCache.get(tokenId);
  const now = Date.now();
  
  if (cached && (now - cached.lastUpdated) < CACHE_DURATION) {
    return {
      usd: cached.usd,
      usd_24h_change: cached.usd_24h_change
    };
  }

  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=${tokenId}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch price data for ${tokenId}`);
    }
    
    const data = await response.json();
    const tokenData = data[tokenId];
    
    if (!tokenData) {
      throw new Error(`No price data found for ${tokenId}`);
    }

    const priceData = {
      usd: tokenData.usd || 0,
      usd_24h_change: tokenData.usd_24h_change || 0,
      lastUpdated: now
    };

    // Cache the result
    priceCache.set(tokenId, priceData);
    
    return {
      usd: priceData.usd,
      usd_24h_change: priceData.usd_24h_change
    };
  } catch (error) {
    console.error(`Error fetching ${tokenId} price:`, error);
    // Return cached data if available, otherwise fallback
    if (cached) {
      return {
        usd: cached.usd,
        usd_24h_change: cached.usd_24h_change
      };
    }
    return {
      usd: 0,
      usd_24h_change: 0
    };
  }
};

// Clear cache for a specific token (useful after trades)
export const clearTokenPriceCache = (tokenId: string) => {
  priceCache.delete(tokenId);
};

// Clear all price cache
export const clearAllPriceCache = () => {
  priceCache.clear();
};
