
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, Shield, Zap, AlertTriangle, Bot, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzingToken, setAnalyzingToken] = useState(false);
  const { toast } = useToast();

  const fetchTokenData = async (address: string): Promise<TokenData> => {
    try {
      // First try to get basic token info from a DEX aggregator API
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      
      if (!response.ok) {
        throw new Error('Token not found');
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      if (!data.pairs || data.pairs.length === 0) {
        throw new Error('No trading pairs found for this token');
      }
      
      // Get the most liquid pair (highest volume)
      const bestPair = data.pairs.reduce((best: any, current: any) => {
        const bestVolume = parseFloat(best.volume?.h24 || '0');
        const currentVolume = parseFloat(current.volume?.h24 || '0');
        return currentVolume > bestVolume ? current : best;
      });
      
      const tokenInfo = bestPair.baseToken.address.toLowerCase() === address.toLowerCase() 
        ? bestPair.baseToken 
        : bestPair.quoteToken;
      
      return {
        address: address,
        name: tokenInfo.name || 'Unknown Token',
        symbol: tokenInfo.symbol || 'UNKNOWN',
        price: parseFloat(bestPair.priceUsd || '0'),
        priceChange24h: parseFloat(bestPair.priceChange?.h24 || '0'),
        pairAddress: bestPair.pairAddress
      };
    } catch (error) {
      console.error('Error fetching from DexScreener:', error);
      
      // Fallback: Try to get basic token info from another source or use contract calls
      // For now, we'll throw the error to show it to the user
      throw new Error('Unable to fetch token data. Please verify the contract address.');
    }
  };

  const getTokenAnalysis = async (tokenData: TokenData) => {
    setAnalyzingToken(true);
    try {
      const analysisPrompt = `Analyze this token for investment potential:
Token: ${tokenData.name} (${tokenData.symbol})
Price: $${tokenData.price}
24h Change: ${tokenData.priceChange24h}%
Contract: ${tokenData.address}

Provide a brief 100-word analysis covering potential risks, opportunities, and overall assessment for this token investment.`;

      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { prompt: analysisPrompt },
      });

      if (error) throw error;
      
      if (data.error) throw new Error(data.error);

      setAiAnalysis(data.response);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed the token data"
      });
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not get AI analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAnalyzingToken(false);
    }
  };

  const validateAndFetchToken = async () => {
    if (!tokenAddress.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid token contract address",
        variant: "destructive"
      });
      return;
    }

    // Basic validation for Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress.trim())) {
      toast({
        title: "Invalid Format",
        description: "Please enter a valid Ethereum contract address (0x...)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Scanning token:', tokenAddress);
      const tokenData = await fetchTokenData(tokenAddress.trim());
      
      setScannedToken(tokenData);
      setAiAnalysis(null); // Reset previous analysis
      toast({
        title: "Token Verified",
        description: `${tokenData.symbol} ready for trading`
      });
      
    } catch (error) {
      console.error('Error fetching token:', error);
      toast({
        title: "Token Not Found",
        description: error instanceof Error ? error.message : "Unable to verify token. Check the contract address.",
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
    setAiAnalysis(null);
  };

  return (
    <Card className="bg-black/40 backdrop-blur-md border-white/20 text-white">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg">
            <Search className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Token Scanner</span>
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
                  className="font-mono text-sm pl-4 pr-12 h-14 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-cyan-400 focus:bg-white/15 transition-all"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-semibold text-base shadow-lg transition-all duration-200"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Scanning Token...</span>
                  </div>
                ) : (
                  'Scan Token'
                )}
              </Button>
            </form>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
              <div className="text-center p-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-xs font-medium text-gray-300">Security Check</div>
              </div>
              <div className="text-center p-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-xs font-medium text-gray-300">Live Data</div>
              </div>
              <div className="text-center p-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-xs font-medium text-gray-300">Instant Trade</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-900/50 to-black/50 p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Token Verified</h3>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1 text-sm font-medium">
                  ✓ Active
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 p-4 rounded-xl">
                  <span className="text-sm text-gray-400 block mb-1">Token Name</span>
                  <p className="font-bold text-white text-lg truncate">{scannedToken.name}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <span className="text-sm text-gray-400 block mb-1">Symbol</span>
                  <p className="font-bold text-white text-lg">{scannedToken.symbol}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <span className="text-sm text-gray-400 block mb-1">Current Price</span>
                  <p className="font-bold text-cyan-400 text-lg">
                    ${scannedToken.price > 0.001 ? scannedToken.price.toFixed(6) : scannedToken.price.toExponential(3)}
                  </p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl">
                  <span className="text-sm text-gray-400 block mb-1">24h Change</span>
                  <p className={`font-bold text-lg ${scannedToken.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {scannedToken.priceChange24h >= 0 ? '+' : ''}{scannedToken.priceChange24h.toFixed(2)}%
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-900/80 p-4 rounded-xl">
                <span className="text-sm text-gray-400 block mb-2">Contract Address</span>
                <p className="font-mono text-sm text-gray-200 break-all">{scannedToken.address}</p>
              </div>
              
              {scannedToken.price === 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mt-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    <span className="text-yellow-400 text-sm font-medium">Price data unavailable - proceed with caution</span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Analysis Section */}
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 rounded-2xl border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-purple-400" />
                  AI Analysis
                </h3>
                <Button
                  onClick={() => getTokenAnalysis(scannedToken)}
                  disabled={analyzingToken}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm"
                >
                  {analyzingToken ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    'Get AI Analysis'
                  )}
                </Button>
              </div>

              {aiAnalysis ? (
                <div className="bg-black/30 p-4 rounded-xl">
                  <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{aiAnalysis}</p>
                </div>
              ) : (
                <div className="bg-black/30 p-4 rounded-xl">
                  <p className="text-gray-400 text-sm italic">Click "Get AI Analysis" to receive an investment analysis for this token.</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <Button 
                onClick={handleSelectForTrading}
                className="flex-1 h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold"
              >
                Start Trading
              </Button>
              <Button 
                onClick={resetScanner}
                variant="outline"
                className="flex-1 h-12 border-2 border-white/20 text-white font-semibold hover:bg-white/10"
              >
                Scan New Token
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenScanner;
