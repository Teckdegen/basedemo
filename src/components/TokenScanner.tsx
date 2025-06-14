
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
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
  const [scannedToken, setScannedToken] = useState<TokenData | null>(null);
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

      setScannedToken(mockTokenData);
      toast({
        title: "Token Found",
        description: `Successfully scanned ${mockTokenData.symbol}`
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

  const handleSelectForTrading = () => {
    if (scannedToken) {
      onTokenSelect(scannedToken);
      toast({
        title: "Token Selected",
        description: `${scannedToken.symbol} is now ready for trading`
      });
    }
  };

  const resetScanner = () => {
    setScannedToken(null);
    setTokenAddress('');
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
        {!scannedToken ? (
          <>
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
          </>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Token Details</h3>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  ✅ Verified
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <p className="font-semibold text-gray-800">{scannedToken.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Symbol:</span>
                  <p className="font-semibold text-gray-800">{scannedToken.symbol}</p>
                </div>
                <div>
                  <span className="text-gray-600">Current Price:</span>
                  <p className="font-semibold text-gray-800">${scannedToken.price.toFixed(6)}</p>
                </div>
                <div>
                  <span className="text-gray-600">24h Change:</span>
                  <p className={`font-semibold ${scannedToken.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {scannedToken.priceChange24h >= 0 ? '+' : ''}{scannedToken.priceChange24h.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                <span className="text-gray-600">Contract Address:</span>
                <p className="font-mono text-gray-800 break-all">{scannedToken.address}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={handleSelectForTrading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Start Trading
              </Button>
              <Button 
                onClick={resetScanner}
                variant="outline"
                className="flex-1"
              >
                Scan Another
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenScanner;
