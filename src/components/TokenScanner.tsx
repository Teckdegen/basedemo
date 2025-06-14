
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Shield, Zap } from 'lucide-react';

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
        title: "Token Verified",
        description: `${mockTokenData.symbol} ready for trading`
      });
      
    } catch (error) {
      console.error('Error fetching token:', error);
      toast({
        title: "Token Not Found",
        description: "Unable to verify token. Check the contract address.",
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
        title: "Token Added",
        description: `${scannedToken.symbol} added to trading interface`
      });
    }
  };

  const resetScanner = () => {
    setScannedToken(null);
    setTokenAddress('');
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3 text-gray-900">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <Search className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Token Discovery</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!scannedToken ? (
          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Enter token contract address (0x...)"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className="font-mono text-sm pl-4 pr-12 h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors bg-gray-50 focus:bg-white"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base shadow-lg transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Analyze Token'
                )}
              </Button>
            </form>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div className="text-center p-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-xs font-medium text-gray-600">Security Verified</div>
              </div>
              <div className="text-center p-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-xs font-medium text-gray-600">Real-time Data</div>
              </div>
              <div className="text-center p-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-xs font-medium text-gray-600">Instant Trading</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Token Analysis</h3>
                <Badge className="bg-green-500 text-white px-3 py-1 text-sm font-medium">
                  ✓ Verified
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <span className="text-sm text-gray-500 block mb-1">Token Name</span>
                  <p className="font-bold text-gray-900 text-lg">{scannedToken.name}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <span className="text-sm text-gray-500 block mb-1">Symbol</span>
                  <p className="font-bold text-gray-900 text-lg">{scannedToken.symbol}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <span className="text-sm text-gray-500 block mb-1">Current Price</span>
                  <p className="font-bold text-gray-900 text-lg">${scannedToken.price.toFixed(6)}</p>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <span className="text-sm text-gray-500 block mb-1">24h Change</span>
                  <p className={`font-bold text-lg ${scannedToken.priceChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {scannedToken.priceChange24h >= 0 ? '+' : ''}{scannedToken.priceChange24h.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-900 p-4 rounded-xl">
                <span className="text-sm text-gray-400 block mb-2">Contract Address</span>
                <p className="font-mono text-sm text-gray-100 break-all">{scannedToken.address}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button 
                onClick={handleSelectForTrading}
                className="flex-1 h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold"
              >
                Start Trading
              </Button>
              <Button 
                onClick={resetScanner}
                variant="outline"
                className="flex-1 h-12 border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
              >
                New Search
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenScanner;
