
const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

export interface PriceData {
  usd: number;
  usd_24h_change: number;
}

export const fetchBasePrice = async (): Promise<PriceData> => {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE}/simple/price?ids=base&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch price data');
    }
    
    const data = await response.json();
    
    return {
      usd: data.base?.usd || 0,
      usd_24h_change: data.base?.usd_24h_change || 0
    };
  } catch (error) {
    console.error('Error fetching BASE price:', error);
    // Fallback to a default price if API fails
    return {
      usd: 2500,
      usd_24h_change: 0
    };
  }
};
