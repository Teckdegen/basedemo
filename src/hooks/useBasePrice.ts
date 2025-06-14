
import { useState, useEffect, useCallback } from 'react';
import { fetchBasePrice, clearTokenPriceCache, PriceData } from '@/services/priceService';

export const useBasePrice = () => {
  const [priceData, setPriceData] = useState<PriceData>({
    usd: 0.27, // Set realistic initial value
    usd_24h_change: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const updatePrice = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const newPriceData = await fetchBasePrice();
      setPriceData(newPriceData);
      setLastUpdated(new Date());
      console.log('BASE price updated:', newPriceData);
    } catch (err) {
      setError('Failed to fetch BASE price');
      console.error('BASE price update error:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial price fetch
    updatePrice(true);
    
    // Set up interval to fetch price every 5 minutes (300000ms)
    const interval = setInterval(() => {
      updatePrice(false); // Don't show loading for background updates
    }, 300000);
    
    return () => clearInterval(interval);
  }, [updatePrice]);

  // Force refresh function for after trades
  const forceRefresh = useCallback(async () => {
    console.log('Force refreshing BASE price after trade...');
    clearTokenPriceCache('base-protocol'); // Clear cache to force fresh data
    await updatePrice(true);
  }, [updatePrice]);

  return {
    priceData,
    loading,
    error,
    lastUpdated,
    refreshPrice: updatePrice,
    forceRefresh
  };
};
