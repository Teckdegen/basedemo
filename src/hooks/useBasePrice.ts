
import { useState, useEffect } from 'react';
import { fetchBasePrice, PriceData } from '@/services/priceService';

export const useBasePrice = () => {
  const [priceData, setPriceData] = useState<PriceData>({
    usd: 2500,
    usd_24h_change: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePrice = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const newPriceData = await fetchBasePrice();
      setPriceData(newPriceData);
    } catch (err) {
      setError('Failed to fetch BASE price');
      console.error('Price update error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial price fetch
    updatePrice();
    
    // Set up interval to fetch price every 30 seconds
    const interval = setInterval(updatePrice, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    priceData,
    loading,
    error,
    refreshPrice: updatePrice
  };
};
