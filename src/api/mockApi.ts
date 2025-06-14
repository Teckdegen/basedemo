
// Mock API functions for demonstration
// In a real app, these would be actual API endpoints

export interface TokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  price: number;
  priceChange24h: number;
  volume24h: number;
  pairAddress?: string;
}

export const scanToken = async (contractAddress: string): Promise<TokenInfo> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock token data
  const mockToken: TokenInfo = {
    address: contractAddress,
    name: "Demo Token",
    symbol: "DEMO",
    decimals: 18,
    price: Math.random() * 10 + 0.1,
    priceChange24h: (Math.random() - 0.5) * 20,
    volume24h: Math.random() * 1000000,
    pairAddress: `${contractAddress}-eth-pair`
  };
  
  return mockToken;
};

export const getTokenChart = async (pairAddress: string): Promise<any[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock chart data
  const dataPoints = [];
  const now = Date.now();
  let price = Math.random() * 10 + 0.1;
  
  for (let i = 100; i >= 0; i--) {
    const timestamp = now - (i * 5 * 60 * 1000); // 5-minute intervals
    price += (Math.random() - 0.5) * 0.1;
    dataPoints.push({
      timestamp,
      price: Math.max(0.001, price)
    });
  }
  
  return dataPoints;
};

// Mock user trade functions
export const executeTrade = async (
  walletAddress: string,
  tokenAddress: string,
  type: 'buy' | 'sell',
  amount: number,
  price: number
) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  return {
    success: true,
    transactionId: `mock_tx_${Date.now()}`,
    amount,
    price,
    total: amount * price
  };
};
