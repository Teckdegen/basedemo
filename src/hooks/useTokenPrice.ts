
import { useState, useEffect, useCallback } from 'react';
import { fetchTokenPrice, clearTokenPriceCache, PriceData } from '@/services/priceService';

export const useTokenPrice = (tokenId?: string) => {
  const [priceData, setPriceData] = useState<PriceData>({
    usd: 0,
    usd_24h_change: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const updatePrice = useCallback(async (showLoading = true) => {
    if (!tokenId) return;
    
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const newPriceData = await fetchTokenPrice(tokenId);
      setPriceData(newPriceData);
      setLastUpdated(new Date());
      console.log(`${tokenId} price updated:`, newPriceData);
    } catch (err) {
      setError(`Failed to fetch ${tokenId} price`);
      console.error(`${tokenId} price update error:`, err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    if (!tokenId) return;

    // Initial price fetch
    updatePrice(true);
    
    // Set up interval to fetch price every 5 minutes
    const interval = setInterval(() => {
      updatePrice(false); // Don't show loading for background updates
    }, 300000);
    
    return () => clearInterval(interval);
  }, [tokenId, updatePrice]);

  // Force refresh function for after trades
  const forceRefresh = useCallback(async () => {
    if (!tokenId) return;
    
    console.log(`Force refreshing ${tokenId} price after trade...`);
    clearTokenPriceCache(tokenId); // Clear cache to force fresh data
    await updatePrice(true);
  }, [tokenId, updatePrice]);

  return {
    priceData,
    loading,
    error,
    lastUpdated,
    refreshPrice: updatePrice,
    forceRefresh
  };
};
