
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface TokenData {
  address: string;
  name: string;
  symbol: string;
  price: number;
  priceChange24h: number;
  pairAddress?: string;
}

interface TokenScannerProps {
  onTokenSelect: (token: TokenData) => void;
}

const TokenScanner: React.FC<TokenScannerProps> = ({ onTokenSelect }) => {
  const [tokenAddress, setTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validateAndFetchToken = async () => {
    if (!tokenAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid token contract address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Scanning token:', tokenAddress);
      
      // Mock token data for demo purposes
      // In a real app, you would call your API endpoint
      const mockTokenData: TokenData = {
        address: tokenAddress,
        name: "Demo Token",
        symbol: "DEMO",
        price: Math.random() * 10 + 0.1,
        priceChange24h: (Math.random() - 0.5) * 20,
        pairAddress: `${tokenAddress}-pair`
      };

      onTokenSelect(mockTokenData);
      toast({
        title: "Token Found",
        description: `Successfully loaded ${mockTokenData.symbol}`
      });
      
    } catch (error) {
      console.error('Error fetching token:', error);
      toast({
        title: "Token Not Found",
        description: "Could not find token data. Please check the contract address.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndFetchToken();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>🔍</span>
          <span>Token Scanner</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Enter token contract address (0x...)"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full gradient-bg text-white"
            disabled={loading}
          >
            {loading ? 'Scanning...' : 'Scan Token'}
          </Button>
        </form>
        
        <div className="mt-4 text-sm text-gray-600">
          <p className="mb-2">Popular Base tokens to try:</p>
          <div className="space-y-1">
            <button
              onClick={() => setTokenAddress('0x4200000000000000000000000000000000000006')}
              className="block text-primary-600 hover:underline"
            >
              WETH - 0x4200000000000000000000000000000000000006
            </button>
            <button
              onClick={() => setTokenAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')}
              className="block text-primary-600 hover:underline"
            >
              USDC - 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenScanner;
